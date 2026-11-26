/* /admin — dashboard del administrador. Con los productos de la API calcula los
   indicadores del inventario, la alerta de stock crítico (< 5 unidades) y el gráfico de
   stock por categoría. Con las boletas (GET /boletas) calcula los ingresos, las órdenes y
   los gráficos de ventas. Si las boletas fallan, el resto del resumen se sigue mostrando. */
import { BarrasHorizontales, BarrasVerticales, Dona } from "../../components/Graficos";
import EstadoConsulta from "../../components/EstadoConsulta";
import { useAuth } from "../../context/AuthContext";
import { useConsultaApi } from "../../hooks/useConsultaApi";
import { productosDesdeApi } from "../../services/catalogo";
import {
  ordenesPorEntrega, productosMasVendidos, resumenVentas, stockPorCategoria, ventasPorDia,
} from "../../utils/estadisticas";
import { formatearPrecio } from "../../utils/formato";

function Indicador({ icono, titulo, valor, oscuro = false }) {
  return (
    <div className="col-md-4">
      <div className={`card shadow-sm ${oscuro ? "text-white bg-dark" : "bg-white"}`}>
        <div className="card-body p-4">
          <h5 className={`card-title text-uppercase fw-bold small ${oscuro ? "text-secondary" : "text-muted"}`}>
            <i className={`bi ${icono} me-1`}></i> {titulo}
          </h5>
          <p className={`card-text fs-1 fw-bold mb-0 ${oscuro ? "" : "text-dark"}`}>{valor}</p>
        </div>
      </div>
    </div>
  );
}

function TarjetaGrafico({ titulo, columnas, children }) {
  return (
    <div className={columnas}>
      <section className="card bg-white shadow-sm h-100">
        <div className="card-body p-4">
          <h2 className="h6 text-uppercase fw-bold text-muted mb-4">{titulo}</h2>
          {children}
        </div>
      </section>
    </div>
  );
}

const unidades = (n) => `${n} u.`;

export default function AdminHome() {
  const { datos: productos, error, cargando } = useConsultaApi("/productos", productosDesdeApi);
  const { datos: boletas, error: errorVentas } = useConsultaApi("/boletas");
  const { usuario } = useAuth();

  const totalProductos = productos?.length;
  const totalOfertas = productos?.filter((p) => p.oferta).length;
  const valorInventario = productos?.reduce((acc, p) => acc + p.precio * p.stock, 0);
  const stockCritico = productos?.filter((p) => p.stock < 5) ?? [];
  const ventas = boletas && resumenVentas(boletas);

  return (
    <>
      <header className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 className="h2 fw-bold text-uppercase">Inicio</h1>
        <span className="text-muted">
          Conectado como: <strong className="text-dark">{usuario.nombre}</strong>
        </span>
      </header>

      <EstadoConsulta cargando={cargando} error={error} textoCarga="Calculando indicadores..." />
      {productos && (
        <div className="row g-4 mb-4">
          <Indicador icono="bi-currency-dollar" titulo="Valor inventario" valor={formatearPrecio(valorInventario)} oscuro />
          <Indicador icono="bi-tags-fill" titulo="Productos activos" valor={totalProductos} />
          <Indicador icono="bi-percent" titulo="Productos en oferta" valor={totalOfertas} />
        </div>
      )}

      {ventas && (
        <div className="row g-4 mb-4">
          <Indicador icono="bi-cash-stack" titulo="Ingresos por ventas" valor={formatearPrecio(ventas.ingresos)} oscuro />
          <Indicador icono="bi-receipt" titulo="Órdenes de compra" valor={ventas.ordenes} />
          <Indicador icono="bi-graph-up" titulo="Ticket promedio" valor={formatearPrecio(ventas.ticketPromedio)} />
        </div>
      )}
      {errorVentas && (
        <div className="alert alert-warning rounded-0 border-0 mb-4">
          No se pudieron cargar las ventas: {errorVentas.message}
        </div>
      )}

      <div className="row g-4 mb-5">
        {boletas && (
          <>
            <TarjetaGrafico titulo="Ventas de los últimos 7 días" columnas="col-lg-7">
              <BarrasVerticales
                datos={ventasPorDia(boletas)}
                formato={formatearPrecio}
                descripcion="Gráfico de barras con los ingresos de cada uno de los últimos 7 días"
                textoVacio="Todavía no hay ventas registradas."
              />
            </TarjetaGrafico>
            <TarjetaGrafico titulo="Productos más vendidos" columnas="col-lg-5">
              <BarrasHorizontales
                datos={productosMasVendidos(boletas)}
                formato={unidades}
                descripcion="Gráfico de barras con las unidades vendidas de los 5 productos más vendidos"
                textoVacio="Todavía no hay ventas registradas."
              />
            </TarjetaGrafico>
          </>
        )}
        {productos && (
          <TarjetaGrafico titulo="Stock por categoría" columnas="col-lg-6">
            <Dona
              datos={stockPorCategoria(productos)}
              formato={unidades}
              descripcion="Gráfico de dona con las unidades en stock de cada categoría"
              textoVacio="No hay productos en el catálogo."
            />
          </TarjetaGrafico>
        )}
        {boletas && (
          <TarjetaGrafico titulo="Órdenes por tipo de entrega" columnas="col-lg-6">
            <Dona
              datos={ordenesPorEntrega(boletas)}
              formato={String}
              descripcion="Gráfico de dona con la cantidad de órdenes con despacho y con retiro en tienda"
              textoVacio="Todavía no hay ventas registradas."
            />
          </TarjetaGrafico>
        )}
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
