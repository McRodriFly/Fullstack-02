/* Mantenedor de Productos: CRUD completo sobre la fuente de datos
   simulada (data/productos.js) con formulario de crear/editar y tabla.
   Vista /admin/productos — requisito EP2: conectar persistencia con React. */
import { useState } from "react";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  formatearPrecio,
} from "../../data/productos";

// Estado inicial del formulario (vacío = modo "crear")
const FORM_INICIAL = {
  nombre: "",
  categoria: "",
  precio: "",
  stock: "",
  oferta: false,
  precioOferta: "",
  archivo: "",
};

export default function AdminProductos() {
  // Estado del listado: se recarga desde la fuente de datos tras cada cambio
  const [productos, setProductos] = useState(() => obtenerProductos());
  const [categorias] = useState(() => obtenerCategorias());
  const [form, setForm] = useState(FORM_INICIAL);
  // idEditando: null = creando; número = editando ese producto
  const [idEditando, setIdEditando] = useState(null);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function recargar() {
    setProductos(obtenerProductos());
  }

  // Cargar un producto en el formulario para editarlo
  function handleEditar(producto) {
    setIdEditando(producto.id);
    setForm({
      nombre: producto.nombre,
      categoria: producto.categoria,
      precio: producto.precio,
      stock: producto.stock,
      oferta: producto.oferta,
      precioOferta: producto.precioOferta || "",
      archivo: producto.archivo,
    });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEliminar(id) {
    if (window.confirm("¿Eliminar este producto?")) {
      eliminarProducto(id);
      recargar();
    }
  }

  function handleCancelar() {
    setIdEditando(null);
    setForm(FORM_INICIAL);
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Validación básica del mantenedor
    if (!form.nombre.trim()) return setError("El nombre es obligatorio.");
    if (!form.categoria) return setError("Selecciona una categoría.");
    if (Number(form.precio) <= 0) return setError("El precio debe ser mayor a 0.");
    if (!form.archivo.trim()) return setError("Indica el nombre del archivo de imagen.");
    setError("");

    const datos = {
      ...form,
      precio: Number(form.precio),
      stock: Number(form.stock) || 0,
      precioOferta: form.oferta && form.precioOferta ? Number(form.precioOferta) : 0,
    };

    if (idEditando === null) {
      crearProducto(datos);
    } else {
      actualizarProducto(idEditando, datos);
    }
    handleCancelar();
    recargar();
  }

  return (
    <>
      <header className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 className="h2 fw-bold text-uppercase">Inventario</h1>
      </header>

      {/* Formulario crear/editar */}
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
                  name="categoria" className="form-select rounded-0"
                  value={form.categoria} onChange={handleChange}
                >
                  <option value="">-- Seleccione --</option>
                  {categorias.map((c) => (
                    <option key={c} value={c}>{c}</option>
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
              {/* El precio de oferta solo se muestra si el checkbox está activo */}
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
              <button type="submit" className="btn btn-dark rounded-0 fw-bold px-4">
                {idEditando === null ? "GUARDAR DATOS" : "ACTUALIZAR"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabla de productos */}
      <h5 className="fw-bold text-uppercase mb-3 text-muted">
        <i className="bi bi-list-task me-2"></i>Productos registrados
      </h5>
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
                <td className="text-center">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
