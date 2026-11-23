/* Vista de Categorías: separa los productos por categoría con filtro
   interactivo (vista nueva de la EP2: interactividad mejorada). */
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { obtenerProductos, obtenerCategorias } from "../data/productos";
import { useCarrito } from "../context/CarritoContext";

export default function Categorias() {
  const [productos] = useState(() => obtenerProductos());
  const [categorias] = useState(() => obtenerCategorias());
  // Estado del filtro activo: "todas" o el nombre de una categoría
  const [categoriaActiva, setCategoriaActiva] = useState("todas");
  const { agregarAlCarrito } = useCarrito();

  function handleAgregar(producto, precioFinal) {
    agregarAlCarrito({ ...producto, precio: precioFinal });
  }

  // Filtrado según la categoría seleccionada
  const productosFiltrados =
    categoriaActiva === "todas"
      ? productos
      : productos.filter((p) => p.categoria === categoriaActiva);

  return (
    <section className="container py-5">
      <h2 className="fw-bold text-uppercase text-center mb-2">Categorías</h2>
      <p className="text-muted text-center mb-4">
        Explora la colección oficial según el tipo de producto.
      </p>

      {/* Botones de filtro: uno por categoría + "Todas" */}
      <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
        <button
          className={`btn rounded-0 fw-bold ${categoriaActiva === "todas" ? "btn-danger" : "btn-outline-dark"}`}
          onClick={() => setCategoriaActiva("todas")}
        >
          TODAS
        </button>
        {categorias.map((categoria) => (
          <button
            key={categoria}
            className={`btn rounded-0 fw-bold ${categoriaActiva === categoria ? "btn-danger" : "btn-outline-dark"}`}
            onClick={() => setCategoriaActiva(categoria)}
          >
            {categoria.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="row g-4">
        {productosFiltrados.map((producto) => (
          <ProductCard
            key={producto.id}
            producto={producto}
            onAgregar={handleAgregar}
          />
        ))}
      </div>
    </section>
  );
}
