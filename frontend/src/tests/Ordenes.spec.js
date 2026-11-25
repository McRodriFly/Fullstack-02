/* Órdenes del panel contra el backend simulado: lista, detalle, estados de carga y
   error, y el hook useConsultaApi. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";
import { USUARIOS, errorApi, guardarSesionDePrueba, respuestaJson, simularBackend } from "./helpers";

const DESPACHO = {
  id: 10, usuarioId: 3, fecha: "2026-11-24T12:00:00", estado: "PAGADA",
  subtotal: 64000, descuento: 6400, total: 57600, cuponCodigo: "F1AUDI",
  tipoEntrega: "DESPACHO", direccionEnvio: "Av. Siempre Viva 742", ciudad: "Santiago",
  detalles: [
    { productoId: 4, productoNombre: "Gorra Edición Especial", cantidad: 2, precioUnitario: 32000, subtotal: 64000 },
  ],
};

const RETIRO = {
  id: 11, usuarioId: 1, fecha: "2026-11-24T13:00:00", estado: "PAGADA",
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

// Promesa que la prueba resuelve o rechaza cuando quiere.
function diferida() {
  let resolver, rechazar;
  const promesa = new Promise((res, rej) => { resolver = res; rechazar = rej; });
  return { promesa, resolver, rechazar };
}

describe("Órdenes de compra en el panel", () => {
  beforeEach(() => {
    localStorage.clear();
    guardarSesionDePrueba(USUARIOS.vendedor);
  });
  afterEach(cleanup);

  it("lista las órdenes con su entrega, cantidad de productos y total", async () => {
    simularBackend({ "GET /boletas": () => respuestaJson(200, [DESPACHO, RETIRO]) });
    renderApp("/admin/ordenes");

    expect(screen.getByText("Cargando órdenes...")).toBeTruthy();
    expect(await screen.findByText("Despacho a Santiago")).toBeTruthy();
    expect(screen.getByText("Retiro en tienda")).toBeTruthy();
    expect(screen.getByText("$57.600")).toBeTruthy();
    expect(screen.getAllByTitle("Ver detalle").map((a) => a.getAttribute("href")))
      .toEqual(["/admin/ordenes/10", "/admin/ordenes/11"]);
  });

  it("avisa cuando todavía no hay órdenes", async () => {
    simularBackend({ "GET /boletas": () => respuestaJson(200, []) });
    renderApp("/admin/ordenes");

    expect(await screen.findByText("Todavía no hay órdenes registradas.")).toBeTruthy();
  });

  it("muestra el mensaje del backend si la consulta falla", async () => {
    simularBackend({ "GET /boletas": () => errorApi(500, "Ocurrió un error inesperado") });
    renderApp("/admin/ordenes");

    expect(await screen.findByText("Ocurrió un error inesperado")).toBeTruthy();
  });

  it("el detalle de un despacho muestra dirección, cupón, productos y totales", async () => {
    simularBackend({ "GET /boletas/10": () => respuestaJson(200, DESPACHO) });
    renderApp("/admin/ordenes/10");

    expect(screen.getByText("Cargando orden...")).toBeTruthy();
    expect(await screen.findByText("Gorra Edición Especial")).toBeTruthy();
    expect(screen.getByText("Av. Siempre Viva 742")).toBeTruthy();
    expect(screen.getByText("F1AUDI")).toBeTruthy();
    expect(screen.getByText("$32.000")).toBeTruthy();
    expect(screen.getByText("Total: $57.600")).toBeTruthy();
  });

  it("el detalle de un retiro no muestra dirección y nombra por id un producto eliminado", async () => {
    simularBackend({ "GET /boletas/11": () => respuestaJson(200, RETIRO) });
    renderApp("/admin/ordenes/11");

    expect(await screen.findByText("Producto #99")).toBeTruthy();
    expect(screen.getByText("Sin cupón")).toBeTruthy();
    expect(screen.queryByText("Dirección:")).toBe(null);
  });

  it("una orden inexistente muestra el 404 del backend", async () => {
    simularBackend({ "GET /boletas/99": () => errorApi(404, "La boleta 99 no existe") });
    renderApp("/admin/ordenes/99");

    expect(await screen.findByText("La boleta 99 no existe")).toBeTruthy();
  });

  it("desde la lista se abre el detalle y se vuelve con VOLVER", async () => {
    simularBackend({
      "GET /boletas": () => respuestaJson(200, [DESPACHO]),
      "GET /boletas/10": () => respuestaJson(200, DESPACHO),
    });
    renderApp("/admin/ordenes");

    fireEvent.click(await screen.findByTitle("Ver detalle"));
    expect(await screen.findByText("Orden #10")).toBeTruthy();

    fireEvent.click(screen.getByText("VOLVER"));
    expect(await screen.findByText("Órdenes de compra")).toBeTruthy();
  });

  it("descarta respuestas que llegan después de salir de la página", async () => {
    const lista = diferida();
    const detalle = diferida();
    simularBackend({ "GET /boletas": () => lista.promesa, "GET /boletas/10": () => detalle.promesa });
    const errores = spyOn(console, "error");

    renderApp("/admin/ordenes");
    cleanup();
    renderApp("/admin/ordenes/10");
    cleanup();

    // El hook ignora ambas respuestas: no intenta actualizar componentes desmontados.
    lista.resolver(respuestaJson(200, [DESPACHO]));
    detalle.rechazar(new TypeError("Failed to fetch"));
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));

    expect(errores).not.toHaveBeenCalled();
  });
});
