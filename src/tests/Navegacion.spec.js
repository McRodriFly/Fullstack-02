/* =========================================================
   PRUEBAS DE NAVEGACIÓN Y COMPONENTES GLOBALES
   Abarca: App completa con rutas (Home, detalle, ofertas,
   categorías con useSearchParams, 404), Navbar (contador y
   menú responsivo), Toast y ErrorBoundary.
========================================================= */
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import ErrorBoundary from "../components/ErrorBoundary";
import { guardarCarrito, gorra, conjunto } from "./helpers";

function renderApp(ruta = "/") {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  );
}

describe("Navegación de la tienda (App)", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("Home muestra el catálogo completo de 12 productos", () => {
    renderApp("/");
    expect(screen.getByText("AUDI F1 TEAM MERCH")).toBeTruthy();
    expect(screen.getAllByText("AÑADIR AL CARRITO").length).toBe(12);
  });

  it("agregar desde Home actualiza el contador del Navbar y muestra el toast", () => {
    renderApp("/");
    expect(screen.getByTestId("contador-carrito").textContent).toBe("0");

    fireEvent.click(screen.getAllByText("AÑADIR AL CARRITO")[0]);

    expect(screen.getByTestId("contador-carrito").textContent).toBe("1");
    expect(screen.getByRole("status").textContent).toContain("añadido al carrito");

    // Botón × del toast lo cierra
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

    // Al elegir una opción el menú se cierra y cambia la página
    fireEvent.click(screen.getByText("Ofertas", { selector: "a" }));
    expect(menu.classList.contains("show")).toBe(false);
    expect(screen.getByText(/precio rebajado/i)).toBeTruthy();
  });

  it("detalle de producto: lee el :id de la URL (useParams)", () => {
    renderApp("/producto/4");
    expect(screen.getByText("Gorra Edición Especial")).toBeTruthy();
    expect(screen.getByText(/Stock disponible: 8/)).toBeTruthy();

    fireEvent.click(screen.getByText("AÑADIR AL CARRITO"));
    expect(screen.getByTestId("contador-carrito").textContent).toBe("1");
  });

  it("detalle de producto sin oferta muestra solo el precio normal", () => {
    const { container } = renderApp("/producto/1");
    expect(screen.getByText("$120.000")).toBeTruthy();
    expect(container.querySelector(".text-decoration-line-through")).toBe(null);
  });

  it("detalle de producto inexistente muestra 'Producto no encontrado'", () => {
    renderApp("/producto/999");
    expect(screen.getByText("Producto no encontrado")).toBeTruthy();
  });

  it("Ofertas muestra solo los 4 productos rebajados y agrega con precio de oferta", () => {
    renderApp("/ofertas");
    expect(screen.getAllByText("AÑADIR AL CARRITO").length).toBe(4);

    fireEvent.click(screen.getAllByText("AÑADIR AL CARRITO")[0]);
    const guardado = JSON.parse(localStorage.getItem("carritoTienda"));
    expect(guardado[0].precio).toBe(69000); // precio rebajado, no el original (85.000)
  });

  it("Ofertas avisa cuando no hay productos rebajados", () => {
    // Catálogo sin ofertas guardado en la "base de datos"
    const sinOfertas = [{ ...gorra, oferta: false }];
    localStorage.setItem("audi_f1_productos", JSON.stringify(sinOfertas));
    renderApp("/ofertas");
    expect(screen.getByText(/no hay ofertas activas/i)).toBeTruthy();
  });

  it("Categorías filtra por botón y respeta el filtro de la URL (?cat=)", () => {
    renderApp("/categorias");
    expect(screen.getAllByText("AÑADIR AL CARRITO").length).toBe(12);

    fireEvent.click(screen.getByText("GORRAS"));
    expect(screen.getAllByText("AÑADIR AL CARRITO").length).toBe(3);

    fireEvent.click(screen.getByText("TODAS"));
    expect(screen.getAllByText("AÑADIR AL CARRITO").length).toBe(12);

    cleanup();
    renderApp("/categorias?cat=Poleras");
    expect(screen.getAllByText("AÑADIR AL CARRITO").length).toBe(6);
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

  it("en /admin se oculta el Navbar de la tienda", () => {
    renderApp("/admin");
    expect(screen.queryByTestId("contador-carrito")).toBe(null);
    expect(screen.getByText("PANEL DE CONTROL")).toBeTruthy();
  });

  it("compra exitosa sin datos de pedido no rompe la página", () => {
    renderApp("/compra-exitosa");
    expect(screen.getByText("¡COMPRA EXITOSA!")).toBeTruthy();
    expect(screen.queryByText(/N° de pedido/)).toBe(null);
  });
});

describe("ErrorBoundary", () => {
  afterEach(cleanup);

  // Componente que falla a propósito al renderizar
  function ComponenteRoto() {
    throw new Error("falla de prueba");
  }

  it("muestra un mensaje amigable cuando un hijo lanza un error", () => {
    // Mock de console.error: evita ensuciar la salida con el error esperado
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
