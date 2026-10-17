/* /compra-exitosa — resumen del pedido enviado por Checkout en location.state.
   Si se entra directo a la URL, state es null y solo se muestra el mensaje. */
import { Link, useLocation } from "react-router-dom";
import { formatearPrecio } from "../data/productos";

export default function CompraExitosa() {
  const { state } = useLocation();

  return (
    <section className="container py-5 text-center">
      <div className="card border-0 shadow-sm p-5 mx-auto" style={{ maxWidth: "560px" }}>
        <div className="display-1 mb-3">🏁</div>
        <h1 className="fw-bold text-success">¡COMPRA EXITOSA!</h1>
        <p className="text-muted">
          Gracias por apoyar al Audi F1 Team{state?.datos?.nombre ? `, ${state.datos.nombre}` : ""}.
        </p>

        {state && (
          <div className="bg-light p-3 my-4 text-start">
            <p className="mb-1">
              <strong>N° de pedido:</strong> {state.numeroPedido}
            </p>
            <p className="mb-1">
              <strong>Productos:</strong> {state.items}
            </p>
            <p className="mb-1">
              <strong>Total pagado:</strong> {formatearPrecio(state.total)}
            </p>
            <p className="mb-0">
              <strong>Entrega:</strong>{" "}
              {state.datos.entrega === "retiro"
                ? "Retiro en tienda"
                : `Despacho a ${state.datos.direccion}, ${state.datos.ciudad}`}
            </p>
          </div>
        )}

        <Link to="/" className="btn btn-dark rounded-0 fw-bold px-4 py-2">
          VOLVER A LA TIENDA
        </Link>
      </div>
    </section>
  );
}
