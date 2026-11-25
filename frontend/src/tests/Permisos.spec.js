/* Restricciones de acceso según el rol: guardias de rutas, menús del panel y
   modo lectura del vendedor. Se prueba sobre la App completa con sesiones reales
   guardadas en localStorage y el backend simulado. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { borrarSesion } from "../services/sesion";
import { PERMISOS, nombreDelRol, tieneRol } from "../utils/roles";
import {
  USUARIOS, gorra, guardarCarrito, guardarSesionDePrueba, respuestaJson, respuestaSesion, simularBackend,
  simularCatalogo,
} from "./helpers";

function renderApp(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  );
}

function iniciarSesionComo(usuario) {
  simularBackend({ "POST /auth/login": () => respuestaJson(200, respuestaSesion(usuario)) });
  fireEvent.change(document.getElementById("correo"), { target: { value: usuario.correo } });
  fireEvent.change(document.getElementById("password"), { target: { value: "1234" } });
  fireEvent.click(screen.getByText("INGRESAR"));
}

function menuDelPanel() {
  return within(document.getElementById("menuAdmin"))
    .getAllByRole("link")
    .map((a) => a.textContent.trim());
}

describe("Matriz de permisos (utils/roles.js)", () => {
  it("sin sesión no se tiene ningún rol", () => {
    expect(tieneRol(null, PERMISOS.comprar)).toBe(false);
  });

  it("el vendedor ve productos y órdenes, pero no gestiona ni compra", () => {
    const v = USUARIOS.vendedor;
    expect(tieneRol(v, PERMISOS.verProductos)).toBe(true);
    expect(tieneRol(v, PERMISOS.verOrdenes)).toBe(true);
    expect(tieneRol(v, PERMISOS.gestionarProductos)).toBe(false);
    expect(tieneRol(v, PERMISOS.gestionarCategorias)).toBe(false);
    expect(tieneRol(v, PERMISOS.gestionarUsuarios)).toBe(false);
    expect(tieneRol(v, PERMISOS.verResumen)).toBe(false);
    expect(tieneRol(v, PERMISOS.comprar)).toBe(false);
  });

  it("el administrador puede todo y el cliente solo comprar", () => {
    Object.values(PERMISOS).forEach((roles) => expect(tieneRol(USUARIOS.admin, roles)).toBe(true));
    const delCliente = Object.keys(PERMISOS).filter((p) => tieneRol(USUARIOS.cliente, PERMISOS[p]));
    expect(delCliente).toEqual(["comprar"]);
  });

  it("nombra cada rol en español", () => {
    expect(nombreDelRol("ROLE_ADMIN")).toBe("Administrador");
    expect(nombreDelRol("ROLE_VENDEDOR")).toBe("Vendedor");
    expect(nombreDelRol("ROLE_CLIENTE")).toBe("Cliente");
  });
});

describe("Guardias de rutas", () => {
  beforeEach(() => {
    localStorage.clear();
    simularCatalogo();
  });
  afterEach(cleanup);

  it("sin sesión, /admin lleva al login y después de entrar vuelve al panel", async () => {
    renderApp("/admin");
    expect(screen.getByText("Iniciar Sesión", { selector: "h2" })).toBeTruthy();

    iniciarSesionComo(USUARIOS.admin);

    expect(await screen.findByText("Conectado como:", { exact: false })).toBeTruthy();
    expect(screen.getByText("Administrador", { selector: "strong" })).toBeTruthy();
  });

  it("sin sesión, pagar lleva al login y después vuelve al checkout", async () => {
    guardarCarrito([gorra]);
    renderApp("/checkout");
    expect(screen.getByText("Iniciar Sesión", { selector: "h2" })).toBeTruthy();

    iniciarSesionComo(USUARIOS.cliente);

    expect(await screen.findByText("CONFIRMAR PAGO")).toBeTruthy();
  });

  it("el cliente no entra al panel: ve Acceso denegado con un enlace a su inicio", () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    renderApp("/admin/usuarios");

    expect(screen.getByText("Acceso denegado")).toBeTruthy();
    expect(screen.getByText("Cliente", { selector: "strong" })).toBeTruthy();
    expect(screen.getByText("IR A MI INICIO").getAttribute("href")).toBe("/");
  });

  it("el vendedor no puede pagar", () => {
    guardarSesionDePrueba(USUARIOS.vendedor);
    guardarCarrito([gorra]);
    renderApp("/checkout");

    expect(screen.getByText("Acceso denegado")).toBeTruthy();
    expect(screen.getByText("IR A MI INICIO").getAttribute("href")).toBe("/admin/productos");
  });

  it("si la sesión se cierra mientras se usa el panel, vuelve al login", () => {
    guardarSesionDePrueba(USUARIOS.admin);
    renderApp("/admin/productos");
    expect(screen.getByText("Inventario")).toBeTruthy();

    // Por ejemplo, el backend rechazó el refresco del token.
    act(() => borrarSesion());

    expect(screen.getByText("Iniciar Sesión", { selector: "h2" })).toBeTruthy();
  });
});

describe("Panel según el rol", () => {
  beforeEach(() => {
    localStorage.clear();
    simularCatalogo();
  });
  afterEach(cleanup);

  it("el administrador ve las cinco secciones", () => {
    guardarSesionDePrueba(USUARIOS.admin);
    renderApp("/admin");

    expect(menuDelPanel()).toEqual([
      "Resumen Paddock", "Productos", "Categorías", "Órdenes de Compra", "Mantenedor Usuarios", "Volver a la Tienda",
    ]);
    expect(screen.getByTestId("rol-panel").textContent).toBe("Administrador");
  });

  it("el vendedor entra directo a productos y solo ve productos y órdenes", () => {
    guardarSesionDePrueba(USUARIOS.vendedor);
    renderApp("/admin");

    expect(screen.getByText("Inventario")).toBeTruthy();
    expect(menuDelPanel()).toEqual(["Productos", "Órdenes de Compra", "Volver a la Tienda"]);
    expect(screen.getByTestId("rol-panel").textContent).toBe("Vendedor");
  });

  it("el vendedor ve los productos en modo lectura, con su detalle", async () => {
    guardarSesionDePrueba(USUARIOS.vendedor);
    renderApp("/admin/productos");

    expect(screen.getByText("Solo lectura")).toBeTruthy();
    await screen.findByText("Chaqueta Oficial F1");
    expect(screen.queryByText("GUARDAR DATOS")).toBe(null);
    expect(screen.queryAllByTitle("Editar").length).toBe(0);
    expect(screen.queryAllByTitle("Eliminar").length).toBe(0);

    fireEvent.click(screen.getAllByTitle("Ver detalle")[0]);
    const detalle = screen.getByTestId("detalle-producto");
    expect(detalle.textContent).toContain("Producto #1");
    expect(detalle.textContent).toContain("unidades");

    fireEvent.click(screen.getByText("CERRAR"));
    expect(screen.queryByTestId("detalle-producto")).toBe(null);
  });

  it("el detalle muestra el precio de oferta si el producto está rebajado", async () => {
    guardarSesionDePrueba(USUARIOS.admin);
    renderApp("/admin/productos");

    // El producto 2 (Conjunto Deportivo F1) está en oferta en el catálogo inicial.
    fireEvent.click((await screen.findAllByTitle("Ver detalle"))[1]);

    expect(screen.getByTestId("detalle-producto").textContent).not.toContain("Oferta: No");
  });

  it("el vendedor no entra a usuarios aunque escriba la URL", () => {
    guardarSesionDePrueba(USUARIOS.vendedor);
    renderApp("/admin/usuarios");

    expect(screen.getByText("Acceso denegado")).toBeTruthy();
    expect(screen.queryByText("Nuevo usuario")).toBe(null);
  });

  it("el vendedor no entra a categorías aunque escriba la URL", () => {
    guardarSesionDePrueba(USUARIOS.vendedor);
    renderApp("/admin/categorias");

    expect(screen.getByText("Acceso denegado")).toBeTruthy();
    expect(screen.queryByText("Nueva categoría")).toBe(null);
  });

  it("el administrador gestiona las categorías desde el panel", async () => {
    guardarSesionDePrueba(USUARIOS.admin);
    renderApp("/admin");

    fireEvent.click(within(document.getElementById("menuAdmin")).getByText("Categorías"));

    expect(await screen.findByText("Nueva categoría")).toBeTruthy();
    expect(await screen.findByText("Accesorios")).toBeTruthy();
  });
});

describe("Navbar según el rol", () => {
  beforeEach(() => {
    localStorage.clear();
    simularCatalogo();
  });
  afterEach(cleanup);

  it("administrador y vendedor tienen un enlace a su inicio del panel; el cliente no", () => {
    guardarSesionDePrueba(USUARIOS.admin);
    renderApp("/");
    expect(screen.getByText("Panel").closest("a").getAttribute("href")).toBe("/admin");
    cleanup();

    guardarSesionDePrueba(USUARIOS.vendedor);
    renderApp("/");
    expect(screen.getByText("Panel").closest("a").getAttribute("href")).toBe("/admin/productos");
    cleanup();

    guardarSesionDePrueba(USUARIOS.cliente);
    renderApp("/");
    expect(screen.queryByText("Panel")).toBe(null);
  });
});
