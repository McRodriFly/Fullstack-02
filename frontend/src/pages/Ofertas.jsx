/* /ofertas — productos con oferta: true. */
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { obtenerOfertas } from "../data/productos";
import { useCarrito } from "../context/CarritoContext";

export default function Ofertas() {
  const [ofertas] = useState(() => obtenerOfertas());
  const { agregarAlCarrito } = useCarrito();

  function handleAgregar(producto, precioFinal) {
    agregarAlCarrito({ ...producto, precio: precioFinal });
  }

  return (
    <section className="container py-5">
      <h2 className="fw-bold text-uppercase text-center mb-2">Ofertas</h2>
      <p className="text-muted text-center mb-5">
        Productos del Audi F1 Team con precio rebajado por tiempo limitado.
      </p>

      <div className="row g-4">
        {ofertas.length === 0 ? (
          <p className="text-muted text-center">
            Por ahora no hay ofertas activas. ¡Vuelve pronto!
          </p>
        ) : (
          ofertas.map((producto) => (
            <ProductCard
              key={producto.id}
              producto={producto}
              onAgregar={handleAgregar}
            />
          ))
        )}
      </div>
    </section>
  );
}
