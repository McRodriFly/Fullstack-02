/* Dashboard del administrador (/admin): indicadores de ventas y gráficos a partir de las
   boletas del backend simulado, estado sin ventas y fallo de la consulta de boletas. */
import { cleanup, render, screen, within } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import AdminLayout from "../pages/admin/AdminLayout";
import AdminHome from "../pages/admin/AdminHome";
import { BarrasHorizontales, BarrasVerticales, Dona } from "../components/Graficos";
import {
  USUARIOS, errorApi, guardarSesionDePrueba, renderConTienda, simularBackend, simularCatalogo,
} from "./helpers";

// "AAAA-MM-DDT12:00:00" de hace "dias" días, en hora local (como las boletas del backend).
function fechaHaceDias(dias) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}T12:00:00`;
}

function boleta(id, diasAtras, total, detalles, extra = {}) {
  return {
    id, usuarioId: 3, fecha: fechaHaceDias(diasAtras), estado: "PAGADA", subtotal: total, descuento: 0, total,
    cuponCodigo: null, tipoEntrega: "DESPACHO", direccionEnvio: "Av. Siempre Viva 742", ciudad: "Santiago",
    detalles, ...extra,
  };
}
const linea = (productoId, productoNombre, cantidad, precioUnitario) =>
  ({ productoId, productoNombre, cantidad, precioUnitario, subtotal: cantidad * precioUnitario });

function renderDashboard() {
  return renderConTienda(
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
      </Route>
    </Routes>,
    "/admin"
  );
}

describe("Dashboard del administrador", () => {
  let catalogo;
  beforeEach(() => {
    localStorage.clear();
    guardarSesionDePrueba(USUARIOS.admin);
    catalogo = simularCatalogo();
  });
  afterEach(cleanup);

  it("calcula ingresos, órdenes y ticket promedio con las boletas pagadas", async () => {
    catalogo.boletas = [
      boleta(1, 0, 57600, [linea(4, "Gorra Edición Especial", 2, 32000)]),
      boleta(2, 1, 45000, [linea(9, "Polera Tipo 1 - C", 1, 45000)], { tipoEntrega: "RETIRO" }),
      boleta(3, 2, 999999, [linea(4, "Gorra Edición Especial", 9, 111111)], { estado: "ANULADA" }),
    ];
    renderDashboard();

    const ingresos = (await screen.findByText("Ingresos por ventas")).parentElement;
    expect(ingresos.textContent).toContain("$102.600");
    expect(screen.getByText("Órdenes de compra").parentElement.textContent).toContain("2");
    expect(screen.getByText("Ticket promedio").parentElement.textContent).toContain("$51.300");
  });

  it("dibuja los cuatro gráficos con los datos de ventas y de stock", async () => {
    catalogo.boletas = [
      boleta(1, 0, 57600, [linea(4, "Gorra Edición Especial", 2, 32000)]),
      boleta(2, 1, 45000, [linea(9, "Polera Tipo 1 - C", 1, 45000)], { tipoEntrega: "RETIRO" }),
    ];
    renderDashboard();

    const barras = await screen.findByTestId("barras-verticales");
    expect(barras.getAttribute("aria-label")).toContain("últimos 7 días");
    expect(within(barras).getAllByText(/^\d\d\/\d\d$/).length).toBe(7);
    expect(barras.textContent).toContain("$57.600");
    expect(barras.textContent).toContain("$45.000");

    const masVendidos = screen.getByTestId("barras-horizontales");
    expect(within(masVendidos).getByText("Gorra Edición Especial")).toBeTruthy();
    expect(within(masVendidos).getByText("2 u.")).toBeTruthy();

    const [stock, entrega] = screen.getAllByTestId("dona");
    expect(within(stock).getByText("Poleras")).toBeTruthy();
    expect(within(stock).getByText("Gorras")).toBeTruthy();
    expect(within(entrega).getByText("Despacho a domicilio").parentElement.textContent).toContain("1");
    expect(within(entrega).getByText("Retiro en tienda").parentElement.textContent).toContain("1");
  });

  it("sin ventas muestra los avisos en vez de gráficos vacíos, y el stock sigue visible", async () => {
    renderDashboard();

    expect((await screen.findByText("Ingresos por ventas")).parentElement.textContent).toContain("$0");
    expect(screen.getAllByText("Todavía no hay ventas registradas.").length).toBe(3);
    expect(screen.getAllByTestId("grafico-vacio").length).toBe(3);
    expect(screen.getAllByTestId("dona").length).toBe(1);
  });

  it("si fallan las boletas avisa, pero el resto del resumen se sigue mostrando", async () => {
    simularBackend({ "GET /boletas": () => errorApi(500, "Ocurrió un error inesperado") });
    renderDashboard();

    expect(await screen.findByText(/No se pudieron cargar las ventas: Ocurrió un error inesperado/)).toBeTruthy();
    expect(screen.getByText("Productos activos").parentElement.textContent).toContain("12");
    expect(screen.queryByText("Ingresos por ventas")).toBe(null);
    expect(screen.queryByTestId("barras-verticales")).toBe(null);
    expect(screen.getAllByTestId("dona").length).toBe(1);
  });
});

describe("Componentes de gráficos", () => {
  afterEach(cleanup);
  const formato = (n) => `${n} u.`;

  it("BarrasVerticales no escribe el valor de las barras en cero", () => {
    render(
      <BarrasVerticales
        datos={[{ etiqueta: "01/12", valor: 0 }, { etiqueta: "02/12", valor: 5 }]}
        formato={formato} descripcion="Barras de prueba" textoVacio="Nada"
      />
    );
    const svg = screen.getByRole("img", { name: "Barras de prueba" });
    // Dos etiquetas de día y un solo valor escrito: el de la barra en cero se omite.
    expect([...svg.querySelectorAll("text")].map((x) => x.textContent)).toEqual(["01/12", "5 u.", "02/12"]);
    expect(svg.querySelectorAll("rect").length).toBe(2);
  });

  it("BarrasHorizontales escala cada barra respecto del mayor valor", () => {
    render(
      <BarrasHorizontales
        datos={[{ etiqueta: "A", valor: 10 }, { etiqueta: "B", valor: 5 }]}
        formato={formato} descripcion="Barras de prueba" textoVacio="Nada"
      />
    );
    const anchos = [...document.querySelectorAll(".progress-bar")].map((b) => b.style.width);
    expect(anchos).toEqual(["100%", "50%"]);
  });

  it("Dona reparte las porciones según el total y omite las que valen 0", () => {
    render(
      <Dona
        datos={[{ etiqueta: "A", valor: 3 }, { etiqueta: "B", valor: 1 }, { etiqueta: "C", valor: 0 }]}
        formato={String} descripcion="Dona de prueba" textoVacio="Nada"
      />
    );
    const circulos = [...screen.getByRole("img", { name: "Dona de prueba" }).querySelectorAll("circle")];
    // El primero es el fondo gris; luego una porción por cada valor mayor que 0.
    expect(circulos.length).toBe(3);
    expect(circulos[1].getAttribute("stroke-dasharray")).toBe("75 25");
    expect(circulos[2].getAttribute("stroke-dasharray")).toBe("25 75");
    expect(circulos[2].querySelector("title").textContent).toBe("B: 1 (25 %)");
    expect(screen.getByText("C")).toBeTruthy(); // la leyenda sí lista todas las categorías
  });

  it("los tres gráficos muestran el texto de vacío cuando todos los valores son 0", () => {
    const ceros = [{ etiqueta: "A", valor: 0 }];
    render(
      <>
        <BarrasVerticales datos={ceros} formato={formato} descripcion="x" textoVacio="Vacío 1" />
        <BarrasHorizontales datos={ceros} formato={formato} descripcion="x" textoVacio="Vacío 2" />
        <Dona datos={ceros} formato={formato} descripcion="x" textoVacio="Vacío 3" />
      </>
    );
    ["Vacío 1", "Vacío 2", "Vacío 3"].forEach((t) => expect(screen.getByText(t)).toBeTruthy());
  });
});
