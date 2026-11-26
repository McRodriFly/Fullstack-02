/* Cálculos del dashboard del administrador a partir de las boletas y los productos
   que entrega la API. Son funciones puras: cada una devuelve datos listos para graficar
   con la forma { etiqueta, valor }. Las boletas anuladas no cuentan como ventas. */

export function ventasValidas(boletas) {
  return boletas.filter((b) => b.estado !== "ANULADA");
}

/* Indicadores generales: órdenes, ingresos, unidades vendidas y ticket promedio. */
export function resumenVentas(boletas) {
  const validas = ventasValidas(boletas);
  const ingresos = validas.reduce((suma, b) => suma + b.total, 0);
  const unidades = validas.reduce((suma, b) => suma + b.detalles.reduce((s, d) => s + d.cantidad, 0), 0);
  return {
    ordenes: validas.length,
    ingresos,
    unidades,
    ticketPromedio: validas.length === 0 ? 0 : Math.round(ingresos / validas.length),
  };
}

// Clave "AAAA-MM-DD" con la fecha local, para agrupar sin depender de la zona horaria.
function claveDelDia(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/* Ingresos de cada uno de los últimos "dias" días (el último es "hasta"), con 0 en los
   días sin ventas. La fecha de la boleta ("2026-11-24T12:00:00") ya viene en hora local. */
export function ventasPorDia(boletas, dias = 7, hasta = new Date()) {
  const totales = new Map();
  ventasValidas(boletas).forEach((b) => {
    const clave = b.fecha.slice(0, 10);
    totales.set(clave, (totales.get(clave) ?? 0) + b.total);
  });
  return Array.from({ length: dias }, (_, i) => {
    const dia = new Date(hasta);
    dia.setDate(dia.getDate() - (dias - 1 - i));
    return {
      etiqueta: `${String(dia.getDate()).padStart(2, "0")}/${String(dia.getMonth() + 1).padStart(2, "0")}`,
      valor: totales.get(claveDelDia(dia)) ?? 0,
    };
  });
}

/* Los "cantidad" productos con más unidades vendidas. Si el producto ya no existe en
   el catálogo, el backend no envía su nombre y se muestra su número. */
export function productosMasVendidos(boletas, cantidad = 5) {
  const unidades = new Map();
  ventasValidas(boletas).forEach((b) =>
    b.detalles.forEach((d) => {
      const etiqueta = d.productoNombre ?? `Producto #${d.productoId}`;
      unidades.set(etiqueta, (unidades.get(etiqueta) ?? 0) + d.cantidad);
    })
  );
  return [...unidades]
    .map(([etiqueta, valor]) => ({ etiqueta, valor }))
    .sort((a, b) => b.valor - a.valor || a.etiqueta.localeCompare(b.etiqueta, "es"))
    .slice(0, cantidad);
}

/* Unidades en stock por categoría, de la mayor a la menor. */
export function stockPorCategoria(productos) {
  const stock = new Map();
  productos.forEach((p) => stock.set(p.categoria, (stock.get(p.categoria) ?? 0) + p.stock));
  return [...stock]
    .map(([etiqueta, valor]) => ({ etiqueta, valor }))
    .sort((a, b) => b.valor - a.valor || a.etiqueta.localeCompare(b.etiqueta, "es"));
}

/* Cantidad de órdenes por tipo de entrega. */
export function ordenesPorEntrega(boletas) {
  const validas = ventasValidas(boletas);
  const despacho = validas.filter((b) => b.tipoEntrega === "DESPACHO").length;
  return [
    { etiqueta: "Despacho a domicilio", valor: despacho },
    { etiqueta: "Retiro en tienda", valor: validas.length - despacho },
  ];
}
