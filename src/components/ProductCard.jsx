/* Tarjeta de producto. No conoce el carrito: avisa el clic con onAgregar(producto,
   precioFinal) y el padre decide qué hacer. Se reutiliza en Home, Categorías y Ofertas. */
import { Link } from "react-router-dom";
import { formatearPrecio } from "../data/productos";

export default function ProductCard({ producto, onAgregar }) {
  // precioOferta en 0 se trata como "sin oferta" aunque el flag esté activo.
  const enOferta = producto.oferta && producto.precioOferta > 0;
  const precioFinal = enOferta ? producto.precioOferta : producto.precio;

  return (
    <div className="col-12 col-sm-6 col-md-4 col-lg-3">
      <article className="card h-100 border-0 shadow-sm rounded-0">
        <Link to={`/producto/${producto.id}`}>
          <img
            src={`/img/${producto.archivo}`}
            className="card-img-top rounded-0 border-bottom"
            alt={producto.nombre}
          />
        </Link>
        <div className="card-body d-flex flex-column text-center p-4">
          <Link to={`/producto/${producto.id}`} className="text-decoration-none">
            <h5 className="card-title text-dark text-uppercase fw-bold">
              {producto.nombre}
            </h5>
          </Link>
          <p className="card-text text-muted mb-2">{producto.categoria}</p>

          {enOferta ? (
            <p className="mb-3">
              <span className="text-muted text-decoration-line-through me-2">
                {formatearPrecio(producto.precio)}
              </span>
              <span className="fw-bold text-danger">{formatearPrecio(producto.precioOferta)}</span>
            </p>
          ) : (
            <p className="fw-bold text-danger mb-3">{formatearPrecio(producto.precio)}</p>
          )}

          <button
            className="btn btn-dark w-100 mt-auto rounded-0 fw-bold"
            onClick={() => onAgregar(producto, precioFinal)}
          >
            AÑADIR AL CARRITO
          </button>
        </div>
      </article>
    </div>
  );
}
