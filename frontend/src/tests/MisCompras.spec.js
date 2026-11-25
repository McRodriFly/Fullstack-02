/* Historial "Mis compras" del cliente contra el backend simulado: lista con detalle,
   estados vacío y de error, acceso según el rol y enlaces desde el menú y la compra. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import {
  USUARIOS, errorApi, guardarCarrito, guardarSesionDePrueba, gorra, respuestaJson, simularBackend,
  simularCatalogo,
} from "./helpers";

const DESPACHO = {
  id: 10, usuarioId: 3, fecha: "2026-11-24T12:00:00", estado: "PAGADA",
  subtotal: 64000, descuento: 6400, total: 57600, cuponCodigo: "F1AUDI",
  tipoEntrega: "DESPACHO", direccionEnvio: "Av. Siempre Viva 742", ciudad: "Santiago",
  detalles: [
    { productoId: 4, productoNombre: "Gorra Edición Especial", cantidad: 2, precioUnitario: 32000, subtotal: 64000 },
  ],
};

const RETIRO = {
  id: 9, usuarioId: 3, fecha: "2026-11-23T13:00:00", estado: "PAGADA",
  subtotal: 45000, descuento: 0, total: 45000, cuponCodigo: null,
  tipoEntrega: "RETIRO", direccionEnvio: null, ciudad: null,
  detalles: [
    // Producto eliminado del catálogo: el backend ya no envía su nombre.
    { productoId: 99, productoNombre: null, cantidad: 1, precioUnitario: 45000, subtotal: 45000 },
  ],
};

function renderApp(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>
  );
}

describe("Mis compras", () => {
  beforeEach(() => {
    localStorage.clear();
    simularCatalogo();
  });
  afterEach(cleanup);

  it("lista las compras del cliente con su detalle, entrega y totales", async () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    simularBackend({ "GET /boletas/mias": () => respuestaJson(200, [DESPACHO, RETIRO]) });
    renderApp("/mis-compras");

    expect(screen.getByText("Cargando tus compras...")).toBeTruthy();
    expect(await screen.findByText("Gorra Edición Especial")).toBeTruthy();

    const compras = screen.getAllByTestId("compra");
    expect(compras.length).toBe(2);
    expect(compras[0].textContent).toContain("Pedido #10");
    expect(compras[0].textContent).toContain("Despacho a Santiago");
    expect(compras[0].textContent).toContain("F1AUDI");
    expect(within(compras[0]).getByText("Total: $57.600")).toBeTruthy();
    expect(compras[1].textContent).toContain("Retiro en tienda");
    expect(compras[1].textContent).toContain("Sin cupón");
    expect(within(compras[1]).getByText("Producto #99")).toBeTruthy();
  });

  it("avisa cuando todavía no hay compras y ofrece volver a la tienda", async () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    simularBackend({ "GET /boletas/mias": () => respuestaJson(200, []) });
    renderApp("/mis-compras");

    expect(await screen.findByText("Todavía no has realizado compras.")).toBeTruthy();
    expect(screen.getByText("IR A LA TIENDA").getAttribute("href")).toBe("/");
    expect(screen.queryByTestId("compra")).toBe(null);
  });

  it("muestra el mensaje del backend si la consulta falla", async () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    simularBackend({ "GET /boletas/mias": () => errorApi(500, "Ocurrió un error inesperado") });
    renderApp("/mis-compras");

    expect(await screen.findByText("Ocurrió un error inesperado")).toBeTruthy();
  });

  it("sin sesión lleva al login; el vendedor no tiene historial de compras", () => {
    renderApp("/mis-compras");
    expect(screen.getByText("Iniciar Sesión", { selector: "h2" })).toBeTruthy();
    cleanup();

    guardarSesionDePrueba(USUARIOS.vendedor);
    renderApp("/mis-compras");
    expect(screen.getByText("Acceso denegado")).toBeTruthy();
  });

  it("el menú muestra «Mis compras» a quien compra y lo oculta al vendedor y al visitante", async () => {
    renderApp("/");
    expect(screen.queryByText("Mis compras")).toBe(null);
    cleanup();

    guardarSesionDePrueba(USUARIOS.vendedor);
    renderApp("/");
    expect(screen.queryByText("Mis compras")).toBe(null);
    cleanup();

    guardarSesionDePrueba(USUARIOS.cliente);
    simularBackend({ "GET /boletas/mias": () => respuestaJson(200, [RETIRO]) });
    renderApp("/");
    fireEvent.click(screen.getByText("Mis compras"));
    expect(await screen.findByText("Pedido #9", { exact: false })).toBeTruthy();
  });

  it("después de pagar, la compra exitosa ofrece ir al historial", async () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    guardarCarrito([gorra]);
    simularBackend({ "GET /boletas/mias": () => respuestaJson(200, [RETIRO]) });
    renderApp("/compra-exitosa");

    fireEvent.click(screen.getByText("VER MIS COMPRAS"));

    expect(await screen.findByText("Historial de tus pedidos en la tienda.")).toBeTruthy();
  });
});
