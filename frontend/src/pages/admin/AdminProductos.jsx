/* /admin/productos — CRUD de productos contra la API (/api/v1/productos).
   El mismo formulario sirve para crear y editar: idEditando === null es "crear".
   Crear, editar y eliminar son solo del administrador (el backend lo exige también).
   El vendedor ve la lista y el detalle en modo lectura: sin formulario ni acciones
   de editar o eliminar. */
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import EstadoConsulta from "../../components/EstadoConsulta";
import { useConsultaApi } from "../../hooks/useConsultaApi";
import { describirError } from "../../services/api";
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  productosDesdeApi,
} from "../../services/catalogo";
import { formatearPrecio } from "../../utils/formato";
import { PERMISOS, tieneRol } from "../../utils/roles";

const FORM_INICIAL = {
  nombre: "",
  categoriaId: "",
  precio: "",
  stock: "",
  oferta: false,
  precioOferta: "",
  archivo: "",
};

export default function AdminProductos() {
  const productosApi = useConsultaApi("/productos", productosDesdeApi);
  const categoriasApi = useConsultaApi("/categorias");
  const productos = productosApi.datos;
  const categorias = categoriasApi.datos ?? [];
  const [form, setForm] = useState(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [error, setError] = useState("");
  const [detalle, setDetalle] = useState(null);
  const { usuario } = useAuth();
  const puedeGestionar = tieneRol(usuario, PERMISOS.gestionarProductos);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function handleEditar(producto) {
    setIdEditando(producto.id);
    setForm({
      nombre: producto.nombre,
      categoriaId: producto.categoriaId,
      precio: producto.precio,
      stock: producto.stock,
      oferta: producto.oferta,
      precioOferta: producto.precioOferta || "",
      archivo: producto.archivo,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      await eliminarProducto(id);
      setError("");
      productosApi.recargar();
    } catch (err) {
      // Por ejemplo, 409 si el producto ya fue vendido.
      setError(describirError(err));
    }
  }

  function handleCancelar() {
    setIdEditando(null);
    setForm(FORM_INICIAL);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.categoriaId) return setError("Selecciona una categoría.");
    if (Number(form.precio) <= 0) return setError("El precio debe ser mayor a 0.");
    if (!form.archivo.trim()) return setError("Indica el nombre del archivo de imagen.");
    setError("");

    setGuardando(true);
    try {
      if (idEditando === null) {
        await crearProducto(form);
      } else {
        await actualizarProducto(idEditando, form);
      }
      handleCancelar();
      productosApi.recargar();
    } catch (err) {
      // El backend valida de nuevo (por ejemplo, oferta menor que el precio).
      setError(describirError(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <header className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 className="h2 fw-bold text-uppercase">Inventario</h1>
        {!puedeGestionar && <span className="badge bg-secondary text-uppercase">Solo lectura</span>}
      </header>

      {detalle && (
        <div className="card border-0 shadow-sm rounded-0 mb-4" data-testid="detalle-producto">
          <div className="card-header bg-dark text-white rounded-0 py-3 d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold text-uppercase small">
              <i className="bi bi-info-circle me-2"></i>Producto #{detalle.id}
            </h5>
            <button type="button" className="btn btn-sm btn-outline-light rounded-0" onClick={() => setDetalle(null)}>
              CERRAR
            </button>
          </div>
          <div className="card-body p-4 bg-white d-flex flex-wrap gap-4 align-items-center">
            <img
              src={`/img/${detalle.archivo}`} alt={detalle.nombre} className="border"
              style={{ width: "140px", height: "140px", objectFit: "cover" }}
            />
            <ul className="list-unstyled mb-0">
              <li className="fs-5 fw-bold">{detalle.nombre}</li>
              <li><strong>Categoría:</strong> {detalle.categoria}</li>
              <li><strong>Precio:</strong> {formatearPrecio(detalle.precio)}</li>
              <li><strong>Oferta:</strong> {detalle.oferta ? formatearPrecio(detalle.precioOferta) : "No"}</li>
              <li><strong>Stock:</strong> {detalle.stock} unidades</li>
            </ul>
          </div>
        </div>
      )}

      {puedeGestionar && (
        <div className="card border-0 shadow-sm rounded-0 mb-5">
          <div className="card-header bg-dark text-white rounded-0 py-3">
            <h5 className="mb-0 fw-bold text-uppercase small">
              <i className="bi bi-pencil-square me-2"></i>
              {idEditando === null ? "Nuevo producto" : `Editando producto #${idEditando}`}
            </h5>
          </div>
          <div className="card-body p-4 bg-white">
            {error && <div className="alert alert-danger rounded-0 border-0">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-uppercase fw-bold small">Nombre del producto</label>
                  <input
                    type="text" name="nombre" className="form-control rounded-0"
                    placeholder="Ej: Gorra F1" value={form.nombre} onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-uppercase fw-bold small">Precio ($ CLP)</label>
                  <input
                    type="number" name="precio" min="1" className="form-control rounded-0"
                    value={form.precio} onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label text-uppercase fw-bold small">Stock</label>
                  <input
                    type="number" name="stock" min="0" className="form-control rounded-0"
                    value={form.stock} onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label text-uppercase fw-bold small">Categoría</label>
                  <select
                    name="categoriaId" className="form-select rounded-0"
                    value={form.categoriaId} onChange={handleChange}
                  >
                    <option value="">-- Seleccione --</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label text-uppercase fw-bold small">Archivo de imagen</label>
                  <input
                    type="text" name="archivo" className="form-control rounded-0"
                    placeholder="Gorra4.jpeg" value={form.archivo} onChange={handleChange}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <div className="form-check">
                    <input
                      type="checkbox" name="oferta" id="oferta" className="form-check-input"
                      checked={form.oferta} onChange={handleChange}
                    />
                    <label className="form-check-label fw-bold" htmlFor="oferta">¿En oferta?</label>
                  </div>
                </div>
                {form.oferta && (
                  <div className="col-md-2">
                    <label className="form-label text-uppercase fw-bold small">Precio oferta</label>
                    <input
                      type="number" name="precioOferta" min="1" className="form-control rounded-0"
                      value={form.precioOferta} onChange={handleChange}
                    />
                  </div>
                )}
              </div>
              <div className="mt-4 text-end border-top pt-3">
                <button type="button" onClick={handleCancelar} className="btn btn-outline-secondary rounded-0 fw-bold me-2 px-4">
                  CANCELAR
                </button>
                <button type="submit" className="btn btn-dark rounded-0 fw-bold px-4" disabled={guardando}>
                  {idEditando === null ? "GUARDAR DATOS" : "ACTUALIZAR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h5 className="fw-bold text-uppercase mb-3 text-muted">
        <i className="bi bi-list-task me-2"></i>Productos registrados
      </h5>
      {/* Si falla una eliminación, el mensaje sale en el formulario (arriba); aquí solo la carga. */}
      <EstadoConsulta cargando={productosApi.cargando} error={productosApi.error} textoCarga="Cargando productos..." />
      {productos && (
        <div className="table-responsive bg-white shadow-sm border-0 mb-5">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-dark">
              <tr className="text-uppercase small">
                <th>ID</th><th>Foto</th><th>Nombre</th><th>Categoría</th>
                <th>Precio</th><th>Stock</th><th>Oferta</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td className="fw-bold text-muted">{String(p.id).padStart(3, "0")}</td>
                  <td>
                    <img
                      src={`/img/${p.archivo}`} alt={p.nombre} className="border"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  </td>
                  <td className="fw-bold">{p.nombre}</td>
                  <td>{p.categoria}</td>
                  <td>{formatearPrecio(p.precio)}</td>
                  <td>{p.stock}</td>
                  <td>
                    {p.oferta ? (
                      <span className="badge bg-danger">{formatearPrecio(p.precioOferta)}</span>
                    ) : (
                      <span className="badge bg-secondary">No</span>
                    )}
                  </td>
                  <td className="text-center text-nowrap">
                    <button
                      className="btn btn-sm btn-outline-secondary rounded-0 me-1" title="Ver detalle"
                      onClick={() => setDetalle(p)}
                    >
                      <i className="bi bi-eye-fill"></i>
                    </button>
                    {puedeGestionar && (
                      <>
                        <button
                          className="btn btn-sm btn-outline-dark rounded-0 me-1" title="Editar"
                          onClick={() => handleEditar(p)}
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger rounded-0" title="Eliminar"
                          onClick={() => handleEliminar(p.id)}
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </>
                    )}
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
