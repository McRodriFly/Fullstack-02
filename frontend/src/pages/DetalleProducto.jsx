/* /producto/:id — ficha de un producto (GET /api/v1/productos/{id}). */
import { useParams, Link } from "react-router-dom";
import { formatearPrecio } from "../utils/formato";
import { useConsultaApi } from "../hooks/useConsultaApi";
import { productoDesdeApi } from "../services/catalogo";
import EstadoConsulta from "../components/EstadoConsulta";
import { useCarrito } from "../context/CarritoContext";

export default function DetalleProducto() {
  const { id } = useParams();
  const { datos: producto, error, cargando } = useConsultaApi(`/productos/${id}`, productoDesdeApi);
  const { agregarAlCarrito } = useCarrito();

  if (cargando) {
    return (
      <section className="container py-5">
        <EstadoConsulta cargando textoCarga="Cargando producto..." />
      </section>
    );
  }

  // El backend responde 404 si el producto no existe; otros errores se muestran tal cual.
  if (error && error.estado !== 404) {
    return (
      <section className="container py-5">
        <EstadoConsulta error={error} />
      </section>
    );
  }

  if (!producto) {
    return (
      <section className="container py-5 text-center">
        <h1 className="fw-bold">Producto no encontrado</h1>
        <Link to="/" className="btn btn-dark rounded-0 fw-bold mt-3">
          VOLVER AL CATÁLOGO
        </Link>
      </section>
    );
  }

  const enOferta = producto.oferta && producto.precioOferta > 0;
  const precioFinal = enOferta ? producto.precioOferta : producto.precio;

  function handleAgregar() {
    agregarAlCarrito({ ...producto, precio: precioFinal });
  }

  return (
    <section className="container py-5">
      <div className="row g-5 align-items-center">
        <div className="col-12 col-md-6 text-center">
          <img
            src={`/img/${producto.archivo}`}
            alt={producto.nombre}
            className="img-fluid border"
          />
        </div>
        <div className="col-12 col-md-6">
          <h1 className="fw-bold text-uppercase">{producto.nombre}</h1>
          <p className="text-muted">{producto.categoria}</p>
          {enOferta ? (
            <p className="fs-4">
              <span className="text-muted text-decoration-line-through me-2">
                {formatearPrecio(producto.precio)}
              </span>
              <span className="fw-bold text-danger">
                {formatearPrecio(producto.precioOferta)}
              </span>
            </p>
          ) : (
            <p className="fs-4 fw-bold text-danger">{formatearPrecio(producto.precio)}</p>
          )}
          <p className="text-secondary">Stock disponible: {producto.stock} unidades.</p>
          <button className="btn btn-dark btn-lg rounded-0 fw-bold" onClick={handleAgregar}>
            AÑADIR AL CARRITO
          </button>
        </div>
      </div>
    </section>
  );
}
