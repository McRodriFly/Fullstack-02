/* /admin/ordenes/:id — detalle de una boleta (GET /api/v1/boletas/{id}): cada
   producto con el precio que se cobró al momento de la compra. */
import { Link, useParams } from "react-router-dom";
import { useConsultaApi } from "../../hooks/useConsultaApi";
import { formatearPrecio } from "../../utils/formato";
import { formatearFecha, textoEntrega } from "./formatoOrden";

export default function AdminOrdenDetalle() {
  const { id } = useParams();
  const { datos: orden, error, cargando } = useConsultaApi(`/boletas/${id}`);

  return (
    <>
      <header className="d-flex justify-content-between align-items-center pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 className="h2 fw-bold text-uppercase">Orden #{id}</h1>
        <Link to="/admin/ordenes" className="btn btn-outline-dark rounded-0 fw-bold btn-sm">
          <i className="bi bi-arrow-left me-1"></i>VOLVER
        </Link>
      </header>

      {cargando && <p className="text-muted">Cargando orden...</p>}
      {error && <div className="alert alert-danger rounded-0 border-0">{error.message}</div>}

      {orden && (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <ul className="list-group list-group-flush shadow-sm">
                <li className="list-group-item"><strong>Fecha:</strong> {formatearFecha(orden.fecha)}</li>
                <li className="list-group-item"><strong>Cliente:</strong> #{orden.usuarioId}</li>
                <li className="list-group-item"><strong>Estado:</strong> {orden.estado}</li>
              </ul>
            </div>
            <div className="col-md-6">
              <ul className="list-group list-group-flush shadow-sm">
                <li className="list-group-item"><strong>Entrega:</strong> {textoEntrega(orden)}</li>
                {orden.tipoEntrega === "DESPACHO" && (
                  <li className="list-group-item"><strong>Dirección:</strong> {orden.direccionEnvio}</li>
                )}
                <li className="list-group-item"><strong>Cupón:</strong> {orden.cuponCodigo ?? "Sin cupón"}</li>
              </ul>
            </div>
          </div>

          <div className="table-responsive bg-white shadow-sm border-0 mb-4">
            <table className="table mb-0 align-middle">
              <thead className="table-dark">
                <tr className="text-uppercase small">
                  <th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orden.detalles.map((d) => (
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

          <div className="text-end">
            <p className="mb-1">Subtotal: {formatearPrecio(orden.subtotal)}</p>
            <p className="mb-1">Descuento: −{formatearPrecio(orden.descuento)}</p>
            <p className="fs-4 fw-bold">Total: {formatearPrecio(orden.total)}</p>
          </div>
        </>
      )}
    </>
  );
}
