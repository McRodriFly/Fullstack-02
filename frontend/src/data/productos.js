/* =========================================================
   FUENTE DE DATOS SIMULADA (actúa como "base de datos")
   Requisito EP2: archivo JS con datos + funciones CRUD.
   Persiste en localStorage para simular backend.
========================================================= */

// Clave usada en localStorage para guardar los productos
const STORAGE_KEY = "audi_f1_productos";

// Catálogo inicial de la tienda (migrado desde js/carrito.js de la EP1)
// Se agregan campos nuevos: stock, oferta y precioOferta (para la vista Ofertas)
const productosIniciales = [
  { id: 1, nombre: "Chaqueta Oficial F1", categoria: "Chaquetas", precio: 120000, archivo: "Chaqueta_1.jpeg", stock: 10, oferta: false, precioOferta: 0 },
  { id: 2, nombre: "Conjunto Deportivo F1", categoria: "Ropa", precio: 85000, archivo: "Conjunto_1.jpeg", stock: 15, oferta: true, precioOferta: 69000 },
  { id: 3, nombre: "Gorra Negra Audi F1", categoria: "Gorras", precio: 35000, archivo: "Gorra1.jpeg", stock: 25, oferta: false, precioOferta: 0 },
  { id: 4, nombre: "Gorra Edición Especial", categoria: "Gorras", precio: 40000, archivo: "Gorra2.jpeg", stock: 8, oferta: true, precioOferta: 32000 },
  { id: 5, nombre: "Gorra Clásica Audi F1", categoria: "Gorras", precio: 35000, archivo: "Gorra3.jpeg", stock: 20, oferta: false, precioOferta: 0 },
  { id: 6, nombre: "Llavero Metálico F1", categoria: "Accesorios", precio: 15000, archivo: "Llavero_1.jpeg", stock: 50, oferta: false, precioOferta: 0 },
  { id: 7, nombre: "Polera Tipo 1 - A", categoria: "Poleras", precio: 45000, archivo: "Polera_Tipo1_1.jpeg", stock: 12, oferta: false, precioOferta: 0 },
  { id: 8, nombre: "Polera Tipo 1 - B", categoria: "Poleras", precio: 45000, archivo: "Polera_Tipo1_2.jpeg", stock: 12, oferta: true, precioOferta: 36000 },
  { id: 9, nombre: "Polera Tipo 1 - C", categoria: "Poleras", precio: 45000, archivo: "Polera_Tipo1_3.jpeg", stock: 5, oferta: false, precioOferta: 0 },
  { id: 10, nombre: "Polera Tipo 2 - A", categoria: "Poleras", precio: 50000, archivo: "Polera_Tipo2_1.jpeg", stock: 10, oferta: false, precioOferta: 0 },
  { id: 11, nombre: "Polera Tipo 2 - B", categoria: "Poleras", precio: 50000, archivo: "Polera_Tipo2_2.jpeg", stock: 10, oferta: true, precioOferta: 40000 },
  { id: 12, nombre: "Polera Tipo 2 - C", categoria: "Poleras", precio: 50000, archivo: "Polera_Tipo2_3.jpeg", stock: 7, oferta: false, precioOferta: 0 },
];

// --- Carga inicial: si no hay datos en localStorage, sembramos el catálogo ---
function cargarProductos() {
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (guardados) {
    return JSON.parse(guardados);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productosIniciales));
  return [...productosIniciales];
}

// Guarda el arreglo completo en localStorage (persistencia simulada)
function guardarProductos(productos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
}

/* ================= CRUD ================= */

// LEER: devuelve todos los productos
export function obtenerProductos() {
  return cargarProductos();
}

// LEER: devuelve un producto por id (o null si no existe)
export function obtenerProductoPorId(id) {
  const productos = cargarProductos();
  return productos.find((p) => p.id === Number(id)) || null;
}

// CREAR: agrega un producto nuevo y devuelve el creado (con id asignado)
export function crearProducto(nuevo) {
  const productos = cargarProductos();
  const nuevoId = productos.length > 0 ? Math.max(...productos.map((p) => p.id)) + 1 : 1;
  const producto = { ...nuevo, id: nuevoId };
  productos.push(producto);
  guardarProductos(productos);
  return producto;
}

// ACTUALIZAR: modifica los campos indicados de un producto existente
export function actualizarProducto(id, cambios) {
  const productos = cargarProductos();
  const indice = productos.findIndex((p) => p.id === Number(id));
  if (indice === -1) return null;
  productos[indice] = { ...productos[indice], ...cambios, id: Number(id) };
  guardarProductos(productos);
  return productos[indice];
}

// ELIMINAR: quita un producto por id. Devuelve true si lo eliminó.
export function eliminarProducto(id) {
  const productos = cargarProductos();
  const filtrados = productos.filter((p) => p.id !== Number(id));
  if (filtrados.length === productos.length) return false;
  guardarProductos(filtrados);
  return true;
}

/* ============== Utilidades de consulta ============== */

// Devuelve solo los productos marcados como oferta (para la vista Ofertas)
export function obtenerOfertas() {
  return cargarProductos().filter((p) => p.oferta === true);
}

// Devuelve la lista de categorías únicas (para la vista Categorías y el admin)
export function obtenerCategorias() {
  return [...new Set(cargarProductos().map((p) => p.categoria))];
}

// Formatea precios a CLP, ej: 120000 -> "$120.000"
export function formatearPrecio(precio) {
  return "$" + Number(precio).toLocaleString("es-CL");
}
