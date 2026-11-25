/* /ofertas — productos en oferta. Se consulta el catálogo y se filtran los rebajados. */
import ProductCard from "../components/ProductCard";
import EstadoConsulta from "../components/EstadoConsulta";
import { useConsultaApi } from "../hooks/useConsultaApi";
import { productosDesdeApi } from "../services/catalogo";
import { useCarrito } from "../context/CarritoContext";

export default function Ofertas() {
  const { datos: productos, error, cargando } = useConsultaApi("/productos", productosDesdeApi);
  const { agregarAlCarrito } = useCarrito();

  function handleAgregar(producto, precioFinal) {
    agregarAlCarrito({ ...producto, precio: precioFinal });
  }

  const ofertas = productos?.filter((p) => p.oferta);

  return (
    <section className="container py-5">
      <h2 className="fw-bold text-uppercase text-center mb-2">Ofertas</h2>
      <p className="text-muted text-center mb-5">
        Productos del Audi F1 Team con precio rebajado por tiempo limitado.
      </p>

      <EstadoConsulta cargando={cargando} error={error} textoCarga="Cargando ofertas..." />
      {ofertas && (
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
      )}
    </section>
  );
}
