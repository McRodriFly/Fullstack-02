/* /admin — KPIs del inventario y alerta de stock crítico (< 5 unidades). */
import { useState } from "react";
import { obtenerProductos, formatearPrecio } from "../../data/productos";

export default function AdminHome() {
  const [productos] = useState(() => obtenerProductos());

  const totalProductos = productos.length;
  const totalOfertas = productos.filter((p) => p.oferta).length;
  const valorInventario = productos.reduce((acc, p) => acc + p.precio * p.stock, 0);
  const stockCritico = productos.filter((p) => p.stock < 5);

  return (
    <>
      <header className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 className="h2 fw-bold text-uppercase">Inicio</h1>
        <span className="text-muted">
          Conectado como: <strong className="text-dark">Administrador Jefe</strong>
        </span>
      </header>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card text-white bg-dark shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title text-secondary text-uppercase fw-bold small">
                <i className="bi bi-currency-dollar me-1"></i> Valor inventario
              </h5>
              <p className="card-text fs-1 fw-bold mb-0">{formatearPrecio(valorInventario)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-white shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title text-muted text-uppercase fw-bold small">
                <i className="bi bi-tags-fill me-1"></i> Productos activos
              </h5>
              <p className="card-text fs-1 fw-bold mb-0 text-dark">{totalProductos}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-white shadow-sm">
            <div className="card-body p-4">
              <h5 className="card-title text-muted text-uppercase fw-bold small">
                <i className="bi bi-percent me-1"></i> Productos en oferta
              </h5>
              <p className="card-text fs-1 fw-bold mb-0 text-dark">{totalOfertas}</p>
            </div>
          </div>
        </div>
      </div>

      {stockCritico.length > 0 && (
        <div className="alert alert-danger rounded-0 border-0 shadow-sm p-4 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
          <div>
            <strong className="d-block text-uppercase mb-1">Atención Sistema de Stock:</strong>
            {stockCritico.map((p) => (
              <span key={p.id} className="d-block">
                "{p.nombre}" — quedan {p.stock} unidades.
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
