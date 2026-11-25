/* /mis-compras — compras del usuario con sesión (GET /api/v1/boletas/mias), de la más
   reciente a la más antigua. Cada boleta ya trae su detalle, con los precios que se
   cobraron al momento de la compra. La ruta exige un rol que pueda comprar. */
import { Link } from "react-router-dom";
import EstadoConsulta from "../components/EstadoConsulta";
import { useConsultaApi } from "../hooks/useConsultaApi";
import { formatearPrecio } from "../utils/formato";
import { formatearFecha, textoEntrega } from "../utils/formatoOrden";

export default function MisCompras() {
  const { datos: compras, error, cargando } = useConsultaApi("/boletas/mias");

  return (
    <section className="container py-5">
      <h1 className="h2 fw-bold text-uppercase text-center mb-2">Mis compras</h1>
      <p className="text-muted text-center mb-5">Historial de tus pedidos en la tienda.</p>

      <EstadoConsulta cargando={cargando} error={error} textoCarga="Cargando tus compras..." />

      {compras?.length === 0 && (
        <div className="text-center">
          <p className="text-muted">Todavía no has realizado compras.</p>
          <Link to="/" className="btn btn-dark rounded-0 fw-bold px-4">IR A LA TIENDA</Link>
        </div>
      )}

      {compras?.map((compra) => (
        <article key={compra.id} className="card border-0 shadow-sm rounded-0 mb-4" data-testid="compra">
          <header className="card-header bg-dark text-white rounded-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <span className="fw-bold text-uppercase small">
              Pedido #{compra.id} · {formatearFecha(compra.fecha)}
            </span>
            <span className="badge bg-danger">{compra.estado}</span>
          </header>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table mb-0 align-middle">
                <thead>
                  <tr className="text-uppercase small">
                    <th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th className="text-end">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {compra.detalles.map((d) => (
                    <tr key={d.productoId}>
                      {/* Si el producto se eliminó del catálogo, el backend ya no envía su nombre. */}
                      <td className="fw-bold">{d.productoNombre ?? `Producto #${d.productoId}`}</td>
                      <td>{d.cantidad}</td>
                      <td>{formatearPrecio(d.precioUnitario)}</td>
                      <td className="text-end">{formatearPrecio(d.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <footer className="card-footer bg-white d-flex flex-wrap justify-content-between gap-3 py-3">
            <div className="small text-muted">
              <div><strong>Entrega:</strong> {textoEntrega(compra)}</div>
              <div><strong>Cupón:</strong> {compra.cuponCodigo ?? "Sin cupón"}</div>
            </div>
            <div className="text-end">
              <div className="small">Subtotal: {formatearPrecio(compra.subtotal)}</div>
              <div className="small">Descuento: −{formatearPrecio(compra.descuento)}</div>
              <div className="fs-5 fw-bold">Total: {formatearPrecio(compra.total)}</div>
            </div>
          </footer>
        </article>
      ))}
    </section>
  );
}
