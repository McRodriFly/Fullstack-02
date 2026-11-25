/* Compras en la API (POST /api/v1/boletas). */
import { api } from "./api";

/* Arma el cuerpo de la compra a partir del carrito. El carrito apila los repetidos
   como ítems separados; el backend espera una línea por producto con su cantidad.
   No se envían precios: el servidor cobra los vigentes del catálogo. */
export function compraParaApi({ carrito, entrega, direccion, ciudad, cuponCodigo }) {
  const cantidades = new Map();
  carrito.forEach((p) => cantidades.set(p.id, (cantidades.get(p.id) ?? 0) + 1));
  return {
    items: [...cantidades].map(([productoId, cantidad]) => ({ productoId, cantidad })),
    tipoEntrega: entrega === "retiro" ? "RETIRO" : "DESPACHO",
    direccionEnvio: direccion.trim(),
    ciudad: ciudad.trim(),
    cuponCodigo: cuponCodigo || null,
  };
}

/* Registra la compra del usuario con sesión iniciada y devuelve la boleta emitida
   (con el total que calculó el servidor). */
export function crearBoleta(datos) {
  return api.post("/boletas", compraParaApi(datos));
}
