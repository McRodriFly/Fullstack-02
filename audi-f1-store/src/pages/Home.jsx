/* Página de inicio: hero + catálogo de productos consumido desde la API REST Spring Boot. */
import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { obtenerProductos } from "../data/productos";
import { useCarrito } from "../context/CarritoContext";
import { fetchProductosAPI } from "../services/api";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { agregarAlCarrito } = useCarrito();

  // Al montar la página, consultamos al Backend Spring Boot por REST
  useEffect(() => {
    fetchProductosAPI()
      .then((data) => {
        if (data && data.length > 0) {
          setProductos(data);
        } else {
          setProductos(obtenerProductos()); // Respaldo local
        }
      })
      .catch(() => {
        setProductos(obtenerProductos());
      })
      .finally(() => setCargando(false));
  }, []);

  function handleAgregar(producto, precioFinal) {
    agregarAlCarrito({ ...producto, precio: precioFinal });
  }

  return (
    <>
      <section className="py-5 bg-light text-center">
        <div className="container">
          <h1 className="display-4 fw-bold">AUDI F1 TEAM MERCH</h1>
          <p className="lead">
            Prepárate para la nueva temporada con nuestra colección oficial (Conectado a Spring Boot REST).
          </p>
        </div>
      </section>

      <section className="container py-5">
        <h2 className="fw-bold text-uppercase text-center mb-5">
          Colección Oficial (API REST)
        </h2>

        {cargando ? (
          <p className="text-center text-muted">Conectando con el servidor backend...</p>
        ) : (
          <div className="row g-4">
            {productos.map((producto) => (
              <ProductCard
                key={producto.id}
                producto={producto}
                onAgregar={handleAgregar}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
