/* Página de inicio: hero + catálogo de productos.
   Lee los productos desde la "base de datos" (data/productos.js)
   y usa el estado global del carrito para agregar ítems. */
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { obtenerProductos } from "../data/productos";
import { useCarrito } from "../context/CarritoContext";

export default function Home() {
  // Estado local: listado de productos cargado desde la fuente de datos
  const [productos] = useState(() => obtenerProductos());
  const { agregarAlCarrito } = useCarrito();

  // Función pasada por props a cada ProductCard.
  // Agrega el producto con su precio final (respeta oferta).
  // El toast de confirmación lo dispara el propio contexto.
  function handleAgregar(producto, precioFinal) {
    agregarAlCarrito({ ...producto, precio: precioFinal });
  }

  return (
    <>
      {/* Hero banner (igual que la EP1) */}
      <section className="py-5 bg-light text-center">
        <div className="container">
          <h1 className="display-4 fw-bold">AUDI F1 TEAM MERCH</h1>
          <p className="lead">
            Prepárate para la nueva temporada con nuestra colección oficial.
          </p>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="fw-bold text-uppercase text-center mb-5">
          Colección Oficial
        </h2>
        <div className="row g-4">
          {/* Renderizamos una tarjeta por cada producto de la fuente de datos */}
          {productos.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onAgregar={handleAgregar}
            />
          ))}
        </div>
      </section>
    </>
  );
}
