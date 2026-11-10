/* Vista de compra fallida: se muestra cuando el pago es rechazado.
   El carrito NO se vacía para que el cliente pueda reintentar (EP2). */
import { Link, useLocation } from "react-router-dom";

export default function CompraFallida() {
  const { state } = useLocation();

  return (
    <section className="container py-5 text-center">
      <div className="card border-0 shadow-sm p-5 mx-auto" style={{ maxWidth: "560px" }}>
        <div className="display-1 mb-3">🚩</div>
        <h1 className="fw-bold text-danger">NO SE PUDO REALIZAR EL PAGO</h1>
        <p className="text-muted">
          Tu banco rechazó la transacción. Revisa los datos de tu tarjeta
          e inténtalo nuevamente.
        </p>

        {state?.numeroPedido && (
          <p className="small text-muted">
            Referencia: {state.numeroPedido}
          </p>
        )}

        <div className="d-flex justify-content-center gap-3 mt-3">
          <Link to="/checkout" className="btn btn-danger rounded-0 fw-bold px-4 py-2">
            REINTENTAR PAGO
          </Link>
          <Link to="/carrito" className="btn btn-outline-dark rounded-0 fw-bold px-4 py-2">
            VER CARRITO
          </Link>
        </div>
      </div>
    </section>
  );
}
