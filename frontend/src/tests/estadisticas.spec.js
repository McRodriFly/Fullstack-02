/* Cálculos del dashboard: indicadores y series que se grafican a partir de boletas y productos. */
import {
  ordenesPorEntrega, productosMasVendidos, resumenVentas, stockPorCategoria, ventasPorDia, ventasValidas,
} from "../utils/estadisticas";

function boleta(id, fecha, total, detalles, extra = {}) {
  return { id, fecha, total, estado: "PAGADA", tipoEntrega: "DESPACHO", detalles, ...extra };
}
const linea = (productoId, productoNombre, cantidad) => ({ productoId, productoNombre, cantidad });

const BOLETAS = [
  boleta(1, "2026-11-24T12:00:00", 57600, [linea(4, "Gorra Edición Especial", 2), linea(9, "Polera Tipo 1 - C", 1)]),
  boleta(2, "2026-11-24T18:30:00", 45000, [linea(9, "Polera Tipo 1 - C", 1)], { tipoEntrega: "RETIRO" }),
  boleta(3, "2026-11-22T09:00:00", 15000, [linea(99, null, 1)]),
  boleta(4, "2026-11-23T10:00:00", 999999, [linea(4, "Gorra Edición Especial", 50)], { estado: "ANULADA" }),
];

describe("Estadísticas del dashboard", () => {
  it("las boletas anuladas no cuentan como ventas", () => {
    expect(ventasValidas(BOLETAS).map((b) => b.id)).toEqual([1, 2, 3]);
  });

  it("resumenVentas suma órdenes, ingresos y unidades y calcula el ticket promedio", () => {
    expect(resumenVentas(BOLETAS)).toEqual({ ordenes: 3, ingresos: 117600, unidades: 5, ticketPromedio: 39200 });
  });

  it("resumenVentas sin boletas devuelve ceros en vez de dividir por cero", () => {
    expect(resumenVentas([])).toEqual({ ordenes: 0, ingresos: 0, unidades: 0, ticketPromedio: 0 });
  });

  it("ventasPorDia agrupa por día, deja en 0 los días sin ventas y termina en la fecha indicada", () => {
    const serie = ventasPorDia(BOLETAS, 4, new Date(2026, 10, 25, 15, 0));
    expect(serie).toEqual([
      { etiqueta: "22/11", valor: 15000 },
      { etiqueta: "23/11", valor: 0 }, // la boleta anulada de ese día no suma
      { etiqueta: "24/11", valor: 102600 },
      { etiqueta: "25/11", valor: 0 },
    ]);
  });

  it("ventasPorDia usa los últimos 7 días contando hasta hoy si no se le indica otra cosa", () => {
    const serie = ventasPorDia([]);
    expect(serie.length).toBe(7);
    expect(serie.every((d) => d.valor === 0)).toBe(true);
    const hoy = new Date();
    const ultimo = `${String(hoy.getDate()).padStart(2, "0")}/${String(hoy.getMonth() + 1).padStart(2, "0")}`;
    expect(serie[6].etiqueta).toBe(ultimo);
  });

  it("ventasPorDia cruza el cambio de mes sin repetir ni saltarse días", () => {
    const serie = ventasPorDia([], 3, new Date(2026, 11, 1, 10, 0));
    expect(serie.map((d) => d.etiqueta)).toEqual(["29/11", "30/11", "01/12"]);
  });

  it("productosMasVendidos ordena por unidades, nombra los productos ya eliminados y recorta la lista", () => {
    expect(productosMasVendidos(BOLETAS)).toEqual([
      { etiqueta: "Gorra Edición Especial", valor: 2 },
      { etiqueta: "Polera Tipo 1 - C", valor: 2 },
      { etiqueta: "Producto #99", valor: 1 },
    ]);
    expect(productosMasVendidos(BOLETAS, 1).length).toBe(1);
  });

  it("productosMasVendidos desempata por nombre", () => {
    const empate = [boleta(1, "2026-11-24T12:00:00", 1, [linea(2, "Zapatilla", 1), linea(1, "Abrigo", 1)])];
    expect(productosMasVendidos(empate).map((p) => p.etiqueta)).toEqual(["Abrigo", "Zapatilla"]);
  });

  it("stockPorCategoria suma el stock de cada categoría, de mayor a menor", () => {
    const productos = [
      { categoria: "Gorras", stock: 8 }, { categoria: "Poleras", stock: 30 },
      { categoria: "Gorras", stock: 12 }, { categoria: "Ropa", stock: 20 },
    ];
    expect(stockPorCategoria(productos)).toEqual([
      { etiqueta: "Poleras", valor: 30 }, { etiqueta: "Gorras", valor: 20 }, { etiqueta: "Ropa", valor: 20 },
    ]);
    expect(stockPorCategoria([])).toEqual([]);
  });

  it("ordenesPorEntrega separa despacho y retiro sin contar las anuladas", () => {
    expect(ordenesPorEntrega(BOLETAS)).toEqual([
      { etiqueta: "Despacho a domicilio", valor: 2 },
      { etiqueta: "Retiro en tienda", valor: 1 },
    ]);
    expect(ordenesPorEntrega([])).toEqual([
      { etiqueta: "Despacho a domicilio", valor: 0 },
      { etiqueta: "Retiro en tienda", valor: 0 },
    ]);
  });
});
