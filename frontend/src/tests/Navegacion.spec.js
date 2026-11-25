/* App completa contra un backend simulado: rutas, catálogo desde la API, Navbar
   (contador y menú móvil), toast, categorías por URL, página 404 y ErrorBoundary. */
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  guardarCarrito, gorra, conjunto, guardarSesionDePrueba, USUARIOS, CLAVE_SESION,
  errorApi, simularBackend, simularCatalogo,
} from "./helpers";

function renderApp(ruta = "/") {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  );
}

describe("Navegación de la tienda (App)", () => {
  let catalogo;
  beforeEach(() => {
    localStorage.clear();
    catalogo = simularCatalogo();
  });
  afterEach(cleanup);

  it("Home pide el catálogo al backend y muestra los 12 productos", async () => {
    renderApp("/");
    expect(screen.getByText("AUDI F1 TEAM MERCH")).toBeTruthy();
    expect(screen.getByText("Cargando productos...")).toBeTruthy();

    expect((await screen.findAllByText("AÑADIR AL CARRITO")).length).toBe(12);
    expect(screen.queryByText("Cargando productos...")).toBe(null);
  });

  it("si el backend falla, Home muestra el mensaje y no el catálogo", async () => {
    simularBackend({ "GET /productos": () => errorApi(500, "Ocurrió un error inesperado") });
    renderApp("/");

    expect(await screen.findByText("Ocurrió un error inesperado")).toBeTruthy();
    expect(screen.queryByText("AÑADIR AL CARRITO")).toBe(null);
  });

  it("agregar desde Home actualiza el contador del Navbar y muestra el toast", async () => {
    renderApp("/");
    expect(screen.getByTestId("contador-carrito").textContent).toBe("0");

    fireEvent.click((await screen.findAllByText("AÑADIR AL CARRITO"))[0]);

    expect(screen.getByTestId("contador-carrito").textContent).toBe("1");
    expect(screen.getByRole("status").textContent).toContain("añadido al carrito");

    fireEvent.click(screen.getByLabelText("Cerrar notificación"));
    expect(screen.queryByRole("status")).toBe(null);
  });

  it("el contador del Navbar refleja el carrito guardado", () => {
    guardarCarrito([gorra, conjunto]);
    renderApp("/");
    expect(screen.getByTestId("contador-carrito").textContent).toBe("2");
  });

  it("menú hamburguesa: abre y cierra el menú con estado de React", () => {
    const { container } = renderApp("/");
    const menu = container.querySelector("#menuTienda");
    const boton = screen.getByLabelText("Abrir menú");

    expect(menu.classList.contains("show")).toBe(false);
    fireEvent.click(boton);
    expect(menu.classList.contains("show")).toBe(true);
    expect(boton.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(screen.getByText("Ofertas", { selector: "a" }));
    expect(menu.classList.contains("show")).toBe(false);
    expect(screen.getByText(/precio rebajado/i)).toBeTruthy();
  });

  it("detalle de producto: lee el :id de la URL (useParams) y lo pide al backend", async () => {
    renderApp("/producto/4");
    expect(screen.getByText("Cargando producto...")).toBeTruthy();
    expect(await screen.findByText("Gorra Edición Especial")).toBeTruthy();
    expect(screen.getByText(/Stock disponible: 8/)).toBeTruthy();

    fireEvent.click(screen.getByText("AÑADIR AL CARRITO"));
    expect(screen.getByTestId("contador-carrito").textContent).toBe("1");
  });

  it("detalle de producto sin oferta muestra solo el precio normal", async () => {
    const { container } = renderApp("/producto/1");
    expect(await screen.findByText("$120.000")).toBeTruthy();
    expect(container.querySelector(".text-decoration-line-through")).toBe(null);
  });

  it("detalle de producto inexistente (404 del backend) muestra 'Producto no encontrado'", async () => {
    renderApp("/producto/999");
    expect(await screen.findByText("Producto no encontrado")).toBeTruthy();
  });

  it("detalle de producto con otro error del backend muestra su mensaje", async () => {
    simularBackend({ "GET /productos/:id": () => errorApi(500, "Ocurrió un error inesperado") });
    renderApp("/producto/4");

    expect(await screen.findByText("Ocurrió un error inesperado")).toBeTruthy();
    expect(screen.queryByText("Producto no encontrado")).toBe(null);
  });

  it("Ofertas muestra solo los 4 productos rebajados y agrega con precio de oferta", async () => {
    renderApp("/ofertas");
    expect((await screen.findAllByText("AÑADIR AL CARRITO")).length).toBe(4);

    fireEvent.click(screen.getAllByText("AÑADIR AL CARRITO")[0]);
    const guardado = JSON.parse(localStorage.getItem("carritoTienda"));
    expect(guardado[0].precio).toBe(69000); // precio rebajado, no el original (85.000)
  });

  it("Ofertas avisa cuando no hay productos rebajados", async () => {
    catalogo.productos = catalogo.productos.map((p) => ({ ...p, oferta: false, precioOferta: null }));
    renderApp("/ofertas");
    expect(await screen.findByText(/no hay ofertas activas/i)).toBeTruthy();
  });

  it("Ofertas muestra el error del backend", async () => {
    simularBackend({ "GET /productos": () => errorApi(500, "Ocurrió un error inesperado") });
    renderApp("/ofertas");
    expect(await screen.findByText("Ocurrió un error inesperado")).toBeTruthy();
  });

  it("Categorías filtra por botón y respeta el filtro de la URL (?cat=)", async () => {
    renderApp("/categorias");
    expect((await screen.findAllByText("AÑADIR AL CARRITO")).length).toBe(12);
    // Los botones salen de GET /categorias.
    fireEvent.click(await screen.findByText("GORRAS"));
    expect(screen.getAllByText("AÑADIR AL CARRITO").length).toBe(3);

    fireEvent.click(screen.getByText("TODAS"));
    expect(screen.getAllByText("AÑADIR AL CARRITO").length).toBe(12);

    cleanup();
    renderApp("/categorias?cat=Poleras");
    expect((await screen.findAllByText("AÑADIR AL CARRITO")).length).toBe(6);
    fireEvent.click(screen.getAllByText("AÑADIR AL CARRITO")[0]);
    expect(screen.getByTestId("contador-carrito").textContent).toBe("1");
  });

  it("páginas informativas (Nosotros y Blog) se renderizan", () => {
    renderApp("/nosotros");
    expect(screen.getByText("Nuestra Historia en la Pista")).toBeTruthy();
    cleanup();
    renderApp("/blog");
    expect(screen.getAllByText("Leer Caso Completo").length).toBe(2);
  });

  it("una ruta inexistente muestra la página 404 con la ruta pedida", () => {
    renderApp("/no-existe");
    expect(screen.getByText("Página no encontrada")).toBeTruthy();
    expect(screen.getByText("/no-existe")).toBeTruthy();
  });

  it("Categorías muestra el error si falla la consulta de categorías", async () => {
    simularBackend({ "GET /categorias": () => errorApi(500, "Ocurrió un error inesperado") });
    renderApp("/categorias");
    expect(await screen.findByText("Ocurrió un error inesperado")).toBeTruthy();
  });

  it("en /admin se oculta el Navbar de la tienda", () => {
    guardarSesionDePrueba(USUARIOS.admin);
    renderApp("/admin");
    expect(screen.queryByTestId("contador-carrito")).toBe(null);
    expect(screen.getByText("PANEL DE CONTROL")).toBeTruthy();
  });

  it("sin sesión el Navbar ofrece iniciar sesión", () => {
    renderApp();
    expect(screen.getByText("Iniciar Sesión")).toBeTruthy();
    expect(screen.queryByText("Cerrar Sesión")).toBe(null);
  });

  it("con sesión guardada el Navbar muestra al usuario y permite cerrar sesión", () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    renderApp("/ofertas");

    expect(screen.getByTestId("usuario-conectado").textContent).toContain("Cliente");
    fireEvent.click(screen.getByText("Cerrar Sesión"));

    expect(screen.getByText("Iniciar Sesión")).toBeTruthy();
    expect(localStorage.getItem(CLAVE_SESION)).toBe(null);
    // Al salir vuelve al inicio de la tienda.
    expect(screen.getByText("AUDI F1 TEAM MERCH")).toBeTruthy();
  });

  it("el panel muestra al usuario y al cerrar sesión lleva al login", () => {
    guardarSesionDePrueba(USUARIOS.admin);
    renderApp("/admin");

    expect(screen.getByTestId("usuario-panel").textContent).toContain("Administrador");
    fireEvent.click(screen.getByText("Cerrar Sesión"));

    expect(screen.getByText("Iniciar Sesión", { selector: "h2" })).toBeTruthy();
    expect(localStorage.getItem(CLAVE_SESION)).toBe(null);
  });

  it("compra exitosa sin datos de pedido no rompe la página", () => {
    renderApp("/compra-exitosa");
    expect(screen.getByText("¡COMPRA EXITOSA!")).toBeTruthy();
    expect(screen.queryByText(/N° de pedido/)).toBe(null);
  });
});

describe("ErrorBoundary", () => {
  afterEach(cleanup);

  function ComponenteRoto() {
    throw new Error("falla de prueba");
  }

  it("muestra un mensaje amigable cuando un hijo lanza un error", () => {
    // React registra el error en consola; se silencia porque es esperado.
    spyOn(console, "error");

    render(
      <ErrorBoundary>
        <ComponenteRoto />
      </ErrorBoundary>
    );

    expect(screen.getByText("Algo salió mal")).toBeTruthy();
    expect(console.error).toHaveBeenCalled();
  });

  it("REINTENTAR vuelve a renderizar los hijos", () => {
    spyOn(console, "error");
    let debeFallar = true;
    function TalVezRoto() {
      if (debeFallar) throw new Error("falla temporal");
      return <p>Contenido recuperado</p>;
    }

    render(
      <ErrorBoundary>
        <TalVezRoto />
      </ErrorBoundary>
    );
    debeFallar = false;
    fireEvent.click(screen.getByText("REINTENTAR"));

    expect(screen.getByText("Contenido recuperado")).toBeTruthy();
  });

  it("si no hay error, muestra los hijos normalmente", () => {
    render(
      <ErrorBoundary>
        <p>Todo bien</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("Todo bien")).toBeTruthy();
  });
});
