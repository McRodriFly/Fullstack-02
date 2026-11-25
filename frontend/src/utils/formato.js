/* Formato de valores para mostrar en pantalla. */

// 120000 -> "$120.000"
export function formatearPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CL");
}
