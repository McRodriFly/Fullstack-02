/* / — portada y catálogo completo (GET /api/v1/productos). */
import ProductCard from "../components/ProductCard";
import EstadoConsulta from "../components/EstadoConsulta";
import { useConsultaApi } from "../hooks/useConsultaApi";
import { productosDesdeApi } from "../services/catalogo";
import { useCarrito } from "../context/CarritoContext";

export default function Home() {
  const { datos: productos, error, cargando } = useConsultaApi("/productos", productosDesdeApi);
  const { agregarAlCarrito } = useCarrito();

  // Se guarda el precio final para que un producto en oferta entre al carrito
  // con el precio rebajado.
  function handleAgregar(producto, precioFinal) {
    agregarAlCarrito({ ...producto, precio: precioFinal });
  }

  return (
    <>
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
        <EstadoConsulta cargando={cargando} error={error} textoCarga="Cargando productos..." />
        {productos && (
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
