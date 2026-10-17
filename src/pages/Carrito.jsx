/* /carrito — lista de ítems, cupón de descuento y resumen.
   Los ítems y totales vienen de CarritoContext; aquí solo vive el estado del
   formulario del cupón y los mensajes de la vista. */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { formatearPrecio } from "../data/productos";

export default function Carrito() {
  const {
    carrito,
    subtotal,
    total,
    descuento,
    eliminarDelCarrito,
    aplicarCupon,
  } = useCarrito();

  const [cupon, setCupon] = useState("");
  const [mensajeCupon, setMensajeCupon] = useState("");
  const [avisoPago, setAvisoPago] = useState("");
  const navigate = useNavigate();

  function handleAplicarCupon() {
    if (carrito.length === 0) {
      setMensajeCupon("Agrega productos antes de aplicar un cupón.");
      return;
    }
    if (aplicarCupon(cupon)) {
      setMensajeCupon(`Cupón "${cupon.toUpperCase()}" aplicado correctamente.`);
    } else {
      setMensajeCupon("El cupón ingresado no es válido.");
    }
  }

  function handlePagar() {
    if (carrito.length === 0) {
      setAvisoPago("¡Tu carrito está vacío! Agrega productos antes de pagar.");
      return;
    }
    navigate("/checkout");
  }

  return (
    <section className="container py-5">
      <h2 className="fw-bold mb-4">MI CARRITO DE COMPRAS</h2>

      <div className="row g-4">
        <div className="col-lg-8">
          {carrito.length === 0 ? (
            <div className="alert alert-secondary text-center p-5 rounded-0 border-0">
              <h4 className="text-uppercase fw-bold mb-3">Tu carrito está vacío</h4>
              <p className="mb-4">Aún no has agregado merchandising de Audi F1 a tu orden.</p>
              <Link to="/" className="btn btn-dark rounded-0 fw-bold px-4 py-2">
                VER CATÁLOGO
              </Link>
            </div>
          ) : (
            carrito.map((prod, index) => (
              <div
                key={`${prod.id}-${index}`}
                className="d-flex flex-wrap align-items-center gap-3 mb-3 p-3 bg-white shadow-sm border border-light"
              >
                {/* flex-wrap: en pantallas chicas precio y botón pasan a la línea siguiente */}
                <img
                  src={`/img/${prod.archivo}`}
                  alt={prod.nombre}
                  className="border carrito-tabla-img"
                />
                <div className="flex-grow-1">
                  <h5 className="mb-1 text-uppercase fw-bold">{prod.nombre}</h5>
                  <p className="text-muted mb-0">{prod.categoria}</p>
                </div>
                <div className="text-end">
                  <h5 className="fw-bold mb-0 text-danger">{formatearPrecio(prod.precio)}</h5>
                </div>
                <button
                  className="btn btn-outline-danger border-0 fw-bold"
                  onClick={() => eliminarDelCarrito(index)}
                >
                  🗑️ ELIMINAR
                </button>
              </div>
            ))
          )}
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm bg-light p-4 carrito-resumen-card">
            <h5 className="fw-bold mb-4 text-dark">RESUMEN DEL PEDIDO</h5>

            <div className="d-flex justify-content-between mb-3 text-dark">
              <span>Subtotal:</span>
              <span className="fw-bold" data-testid="subtotal-carrito">
                {formatearPrecio(subtotal)}
              </span>
            </div>

            <div className="mb-2">
              <label htmlFor="cupon" className="form-label text-muted">
                Ingrese el cupón de descuento
              </label>
              <div className="input-group">
                <input
                  type="text"
                  id="cupon"
                  className="form-control rounded-0"
                  placeholder="Ej: F1AUDI"
                  autoComplete="off"
                  value={cupon}
                  onChange={(e) => setCupon(e.target.value)}
                />
                <button
                  className="btn btn-outline-dark rounded-0"
                  type="button"
                  onClick={handleAplicarCupon}
                >
                  APLICAR
                </button>
              </div>
            </div>

            {mensajeCupon && <p className="small text-muted mb-3">{mensajeCupon}</p>}

            {descuento > 0 && (
              <div className="d-flex justify-content-between mb-3 text-success">
                <span>Descuento ({descuento}%):</span>
                <span>-{formatearPrecio(subtotal - total)}</span>
              </div>
            )}

            <hr className="border-secondary" />

            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold text-dark fs-5">TOTAL:</span>
              <span className="fw-bold fs-4 text-danger" data-testid="total-carrito">
                {formatearPrecio(total)}
              </span>
            </div>

            <button
              className="btn btn-danger w-100 fw-bold py-3 rounded-0"
              onClick={handlePagar}
            >
              PAGAR
            </button>
            {avisoPago && (
              <div className="alert alert-warning rounded-0 mt-3 mb-0 small" role="alert">
                {avisoPago}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
