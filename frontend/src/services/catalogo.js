/* Productos y categorías en la API (/api/v1/productos y /categorias).
   Las vistas usan una forma plana de producto ({ categoria, archivo, precioOferta: 0
   si no hay oferta }); aquí se traduce desde y hacia lo que entiende el backend
   ({ categoriaId, imagen, precioOferta: null }). */
import { api } from "./api";

export function productoDesdeApi(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    categoriaId: p.categoriaId,
    precio: p.precio,
    precioOferta: p.precioOferta ?? 0,
    oferta: p.oferta,
    archivo: p.imagen,
    stock: p.stock,
  };
}

export const productosDesdeApi = (lista) => lista.map(productoDesdeApi);

/* Datos del formulario de administración -> cuerpo de POST/PUT /productos.
   Sin oferta (o con el precio de oferta vacío), precioOferta va como null. */
export function productoParaApi(form) {
  return {
    nombre: form.nombre.trim(),
    categoriaId: Number(form.categoriaId),
    precio: Number(form.precio),
    precioOferta: form.oferta && form.precioOferta ? Number(form.precioOferta) : null,
    imagen: form.archivo.trim(),
    stock: Number(form.stock) || 0,
  };
}

export async function crearProducto(form) {
  return productoDesdeApi(await api.post("/productos", productoParaApi(form)));
}

export async function actualizarProducto(id, form) {
  return productoDesdeApi(await api.put(`/productos/${id}`, productoParaApi(form)));
}

export function eliminarProducto(id) {
  return api.eliminar(`/productos/${id}`);
}
