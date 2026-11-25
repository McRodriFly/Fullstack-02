/* /categorias — catálogo filtrado por categoría.
   El filtro vive en la URL (?cat=Gorras) con useSearchParams y no en useState:
   el enlace se puede compartir, sobrevive a un recargo y funciona con "atrás". */
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { obtenerProductos, obtenerCategorias } from "../data/productos";
import { useCarrito } from "../context/CarritoContext";

export default function Categorias() {
  const [productos] = useState(() => obtenerProductos());
  const [categorias] = useState(() => obtenerCategorias());
  // Sin ?cat se muestran todas.
  const [searchParams, setSearchParams] = useSearchParams();
  const categoriaActiva = searchParams.get("cat") || "todas";

  function cambiarCategoria(categoria) {
    setSearchParams(categoria === "todas" ? {} : { cat: categoria });
  }
  const { agregarAlCarrito } = useCarrito();

  function handleAgregar(producto, precioFinal) {
    agregarAlCarrito({ ...producto, precio: precioFinal });
  }

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

      <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
        <button
          className={`btn rounded-0 fw-bold ${categoriaActiva === "todas" ? "btn-danger" : "btn-outline-dark"}`}
          onClick={() => cambiarCategoria("todas")}
        >
          TODAS
        </button>
        {categorias.map((categoria) => (
          <button
            key={categoria}
            className={`btn rounded-0 fw-bold ${categoriaActiva === categoria ? "btn-danger" : "btn-outline-dark"}`}
            onClick={() => cambiarCategoria(categoria)}
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
