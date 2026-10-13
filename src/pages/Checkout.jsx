/* =========================================================
   CHECKOUT (/checkout): paso de pago de la EP2.
   El cliente ingresa sus datos, dirección de entrega y pago.
   Incluye validación de formulario con estado (useState).
========================================================= */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { formatearPrecio } from "../data/productos";

// Formulario vacío inicial (estado controlado)
const FORM_INICIAL = {
  nombre: "",
  correo: "",
  direccion: "",
  ciudad: "",
  entrega: "despacho", // despacho | retiro
  tarjeta: "",
  vencimiento: "",
  cvv: "",
};

/* Validación pura del formulario: misma lógica para toda la app
   y fácil de probar con pruebas unitarias (Jasmine/Karma). */
export function validarCheckout(datos) {
  const errores = {};
  if (!datos.nombre.trim() || datos.nombre.trim().length < 3) {
    errores.nombre = "Ingresa tu nombre completo (mínimo 3 caracteres).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
    errores.correo = "Ingresa un correo válido.";
  }
  if (!datos.direccion.trim()) {
    errores.direccion = "La dirección de envío es obligatoria.";
  }
  if (!datos.ciudad.trim()) {
    errores.ciudad = "La ciudad es obligatoria.";
  }
  if (!/^\d{16}$/.test(datos.tarjeta.replace(/\s/g, ""))) {
    errores.tarjeta = "La tarjeta debe tener 16 dígitos.";
  }
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(datos.vencimiento)) {
    errores.vencimiento = "Formato MM/AA.";
  }
  if (!/^\d{3,4}$/.test(datos.cvv)) {
    errores.cvv = "CVV inválido.";
  }
  return errores;
}

// Tarjeta de prueba que simula un pago rechazado (para ver la vista fallida)
const TARJETA_RECHAZADA = "4000000000000002";

export default function Checkout() {
  const { carrito, subtotal, total, descuento, vaciarCarrito } = useCarrito();
  const [datos, setDatos] = useState(FORM_INICIAL);
  const [errores, setErrores] = useState({});
  const navigate = useNavigate();

  // Si llegan sin productos no tiene sentido pagar
  if (carrito.length === 0) {
    return (
      <section className="container py-5 text-center">
        <h2 className="fw-bold">Checkout</h2>
        <p className="text-muted">Tu carrito está vacío.</p>
        <Link to="/" className="btn btn-dark rounded-0 fw-bold mt-2">
          IR AL CATÁLOGO
        </Link>
      </section>
    );
  }

  // Actualiza el estado del formulario a medida que el usuario escribe
  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  // Al pagar: validamos y simulamos el resultado del pago
  function handlePagar(e) {
    e.preventDefault();
    const nuevosErrores = validarCheckout(datos);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return; // hay errores: no avanza

    const numeroPedido = "AUF1-" + Date.now().toString().slice(-6);
    const tarjetaLimpia = datos.tarjeta.replace(/\s/g, "");

    if (tarjetaLimpia === TARJETA_RECHAZADA) {
      // Pago rechazado: NO vaciamos el carrito para que pueda reintentar
      navigate("/compra-fallida", { state: { numeroPedido } });
    } else {
      // Pago exitoso: vaciamos el carrito y mostramos el resumen
      const resumen = { numeroPedido, total, items: carrito.length, datos };
      vaciarCarrito();
      navigate("/compra-exitosa", { state: resumen });
    }
  }

  return (
    <section className="container py-5">
      <h2 className="fw-bold mb-4">CHECKOUT</h2>

      <form onSubmit={handlePagar} noValidate>
        <div className="row g-4">
          {/* Columna izquierda: datos del cliente y pago */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">DATOS DE CONTACTO</h5>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="nombre">Nombre completo</label>
                  <input
                    id="nombre" name="nombre" type="text"
                    className={`form-control rounded-0 ${errores.nombre ? "is-invalid" : ""}`}
                    value={datos.nombre} onChange={handleChange}
                  />
                  {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="correo">Correo electrónico</label>
                  <input
                    id="correo" name="correo" type="email"
                    className={`form-control rounded-0 ${errores.correo ? "is-invalid" : ""}`}
                    value={datos.correo} onChange={handleChange}
                  />
                  {errores.correo && <div className="invalid-feedback">{errores.correo}</div>}
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-3">DIRECCIÓN Y ENTREGA</h5>
              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="form-label" htmlFor="direccion">Dirección</label>
                  <input
                    id="direccion" name="direccion" type="text"
                    className={`form-control rounded-0 ${errores.direccion ? "is-invalid" : ""}`}
                    value={datos.direccion} onChange={handleChange}
                  />
                  {errores.direccion && <div className="invalid-feedback">{errores.direccion}</div>}
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label" htmlFor="ciudad">Ciudad</label>
                  <input
                    id="ciudad" name="ciudad" type="text"
                    className={`form-control rounded-0 ${errores.ciudad ? "is-invalid" : ""}`}
                    value={datos.ciudad} onChange={handleChange}
                  />
                  {errores.ciudad && <div className="invalid-feedback">{errores.ciudad}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="entrega">Opción de entrega</label>
                  <select
                    id="entrega" name="entrega"
                    className="form-select rounded-0"
                    value={datos.entrega} onChange={handleChange}
                  >
                    <option value="despacho">Despacho a domicilio</option>
                    <option value="retiro">Retiro en tienda</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-3">PAGO</h5>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="tarjeta">Número de tarjeta</label>
                  <input
                    id="tarjeta" name="tarjeta" type="text" inputMode="numeric"
                    placeholder="4242424242424242"
                    className={`form-control rounded-0 ${errores.tarjeta ? "is-invalid" : ""}`}
                    value={datos.tarjeta} onChange={handleChange}
                  />
                  {errores.tarjeta && <div className="invalid-feedback">{errores.tarjeta}</div>}
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="vencimiento">Vencimiento (MM/AA)</label>
                  <input
                    id="vencimiento" name="vencimiento" type="text" placeholder="12/28"
                    className={`form-control rounded-0 ${errores.vencimiento ? "is-invalid" : ""}`}
                    value={datos.vencimiento} onChange={handleChange}
                  />
                  {errores.vencimiento && <div className="invalid-feedback">{errores.vencimiento}</div>}
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="cvv">CVV</label>
                  <input
                    id="cvv" name="cvv" type="password" inputMode="numeric" maxLength={4}
                    className={`form-control rounded-0 ${errores.cvv ? "is-invalid" : ""}`}
                    value={datos.cvv} onChange={handleChange}
                  />
                  {errores.cvv && <div className="invalid-feedback">{errores.cvv}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: resumen de la compra */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm bg-light p-4 carrito-resumen-card">
              <h5 className="fw-bold mb-4 text-dark">RESUMEN ({carrito.length} ítems)</h5>

              {carrito.map((prod, index) => (
                <div key={`${prod.id}-${index}`} className="d-flex justify-content-between mb-2 text-dark small">
                  <span>{prod.nombre}</span>
                  <span>{formatearPrecio(prod.precio)}</span>
                </div>
              ))}

              <hr className="border-secondary" />

              <div className="d-flex justify-content-between mb-2 text-dark">
                <span>Subtotal:</span>
                <span>{formatearPrecio(subtotal)}</span>
              </div>
              {descuento > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Descuento ({descuento}%):</span>
                  <span>-{formatearPrecio(subtotal - total)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold text-dark fs-5">TOTAL:</span>
                <span className="fw-bold fs-4 text-danger">{formatearPrecio(total)}</span>
              </div>

              <button type="submit" className="btn btn-danger w-100 fw-bold py-3 rounded-0">
                CONFIRMAR PAGO
              </button>
              <p className="small text-muted mt-3 mb-0">
                💳 Demo: usa la tarjeta <code>4000000000000002</code> para simular un pago rechazado.
              </p>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
