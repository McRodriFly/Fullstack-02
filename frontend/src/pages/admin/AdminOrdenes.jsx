/* /admin/ordenes — todas las boletas de la tienda (GET /api/v1/boletas), de la más
   reciente a la más antigua. La ven el administrador y el vendedor. */
import { Link } from "react-router-dom";
import { useConsultaApi } from "../../hooks/useConsultaApi";
import { formatearPrecio } from "../../utils/formato";
import { formatearFecha, textoEntrega } from "../../utils/formatoOrden";

export default function AdminOrdenes() {
  const { datos: ordenes, error, cargando } = useConsultaApi("/boletas");

  return (
    <>
      <header className="pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 className="h2 fw-bold text-uppercase">Órdenes de compra</h1>
      </header>

      {cargando && <p className="text-muted">Cargando órdenes...</p>}
      {error && <div className="alert alert-danger rounded-0 border-0">{error.message}</div>}
      {ordenes?.length === 0 && <p className="text-muted">Todavía no hay órdenes registradas.</p>}

      {ordenes?.length > 0 && (
        <div className="table-responsive bg-white shadow-sm border-0 mb-5">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-dark">
              <tr className="text-uppercase small">
                <th>N°</th><th>Fecha</th><th>Cliente</th><th>Entrega</th>
                <th>Productos</th><th>Total</th><th>Estado</th>
                <th className="text-center">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id}>
                  <td className="fw-bold text-muted">{o.id}</td>
                  <td>{formatearFecha(o.fecha)}</td>
                  <td>#{o.usuarioId}</td>
                  <td>{textoEntrega(o)}</td>
                  <td>{o.detalles.reduce((suma, d) => suma + d.cantidad, 0)}</td>
                  <td className="fw-bold">{formatearPrecio(o.total)}</td>
                  <td><span className="badge bg-dark">{o.estado}</span></td>
                  <td className="text-center">
                    <Link to={`/admin/ordenes/${o.id}`} className="btn btn-sm btn-outline-dark rounded-0" title="Ver detalle">
                      <i className="bi bi-eye-fill"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
