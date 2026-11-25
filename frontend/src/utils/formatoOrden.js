/* Formatos compartidos por la lista y el detalle de órdenes. */

export function formatearFecha(fechaIso) {
  return new Date(fechaIso).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });
}

export function textoEntrega(orden) {
  return orden.tipoEntrega === "DESPACHO" ? `Despacho a ${orden.ciudad}` : "Retiro en tienda";
}
