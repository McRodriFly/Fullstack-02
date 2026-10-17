/* =========================================================
   PRUEBAS DE LA FUENTE DE DATOS (CRUD de productos.js)
   Abarca: Crear, Leer, Actualizar y Eliminar + consultas.
   Se usa localStorage (mock de la "base de datos") que se
   limpia antes de cada prueba para independencia.
========================================================= */
import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerOfertas,
  formatearPrecio,
} from "../data/productos";

describe("Fuente de datos de productos (CRUD)", () => {
  // Antes de cada prueba limpiamos el almacenamiento para partir de cero
  beforeEach(() => {
    localStorage.clear();
  });

  it("LEER: carga el catálogo inicial con 12 productos", () => {
    const productos = obtenerProductos();
    expect(productos.length).toBe(12);
  });

  it("LEER: encuentra un producto por id y devuelve null si no existe", () => {
    const gorra = obtenerProductoPorId(3);
    expect(gorra.nombre).toContain("Gorra");
    expect(obtenerProductoPorId(999)).toBe(null);
  });

  it("CREAR: agrega un producto nuevo y le asigna un id único", () => {
    const nuevo = crearProducto({
      nombre: "Polerón F1",
      categoria: "Polerones",
      precio: 60000,
      archivo: "Poleron_1.jpeg",
      stock: 5,
      oferta: false,
      precioOferta: 0,
    });
    expect(nuevo.id).toBe(13); // sigue del último id (12)
    expect(obtenerProductos().length).toBe(13);
  });

  it("ACTUALIZAR: modifica los campos de un producto existente", () => {
    const actualizado = actualizarProducto(6, { precio: 12000, stock: 20 });
    expect(actualizado.precio).toBe(12000);
    expect(actualizado.stock).toBe(20);
    // Los campos no mencionados se conservan
    expect(actualizado.nombre).toContain("Llavero");
  });

  it("ACTUALIZAR: devuelve null si el id no existe", () => {
    expect(actualizarProducto(999, { precio: 1 })).toBe(null);
  });

  it("CREAR: con el catálogo vacío el primer producto recibe id 1", () => {
    localStorage.setItem("audi_f1_productos", "[]");
    expect(crearProducto({ nombre: "Primero", precio: 1000 }).id).toBe(1);
  });

  it("ELIMINAR: quita un producto del catálogo", () => {
    const eliminado = eliminarProducto(1);
    expect(eliminado).toBe(true);
    expect(obtenerProductos().length).toBe(11);
    expect(eliminarProducto(999)).toBe(false); // id inexistente
  });

  it("OFERTAS: devuelve solo los productos marcados como oferta", () => {
    const ofertas = obtenerOfertas();
    expect(ofertas.length).toBe(4);
    expect(ofertas.every((p) => p.oferta === true)).toBe(true);
  });

  it("formatearPrecio: formatea el valor como moneda CLP", () => {
    expect(formatearPrecio(120000)).toBe("$120.000");
  });
});
