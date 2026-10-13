/* Mantenedor de Usuarios: listado, crear y eliminar usuarios simulados.
   Vista /admin/usuarios */
import { useState } from "react";
import { obtenerUsuarios, eliminarUsuario, crearUsuario } from "../../data/usuarios";

const FORM_INICIAL = { nombre: "", correo: "", rol: "cliente" };

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState(() => obtenerUsuarios());
  const [form, setForm] = useState(FORM_INICIAL);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.correo.trim()) return;
    crearUsuario(form);
    setForm(FORM_INICIAL);
    setUsuarios(obtenerUsuarios());
  }

  function handleEliminar(id) {
    if (window.confirm("¿Eliminar este usuario?")) {
      eliminarUsuario(id);
      setUsuarios(obtenerUsuarios());
    }
  }

  return (
    <>
      <header className="pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 className="h2 fw-bold text-uppercase">Usuarios</h1>
      </header>

      {/* Crear usuario */}
      <div className="card border-0 shadow-sm rounded-0 mb-5">
        <div className="card-header bg-dark text-white rounded-0 py-3">
          <h5 className="mb-0 fw-bold text-uppercase small">
            <i className="bi bi-person-plus-fill me-2"></i>Nuevo usuario
          </h5>
        </div>
        <div className="card-body p-4 bg-white">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-5">
                <label className="form-label text-uppercase fw-bold small">Nombre</label>
                <input
                  type="text" name="nombre" className="form-control rounded-0"
                  value={form.nombre} onChange={handleChange}
                />
              </div>
              <div className="col-md-5">
                <label className="form-label text-uppercase fw-bold small">Correo</label>
                <input
                  type="email" name="correo" className="form-control rounded-0"
                  value={form.correo} onChange={handleChange}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label text-uppercase fw-bold small">Rol</label>
                <select name="rol" className="form-select rounded-0" value={form.rol} onChange={handleChange}>
                  <option value="cliente">Cliente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="mt-3 text-end">
              <button type="submit" className="btn btn-dark rounded-0 fw-bold px-4">AGREGAR</button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-responsive bg-white shadow-sm border-0 mb-5">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-dark">
            <tr className="text-uppercase small">
              <th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="fw-bold text-muted">{u.id}</td>
                <td className="fw-bold">{u.nombre}</td>
                <td>{u.correo}</td>
                <td>
                  <span className={`badge ${u.rol === "admin" ? "bg-danger" : "bg-secondary"}`}>
                    {u.rol.toUpperCase()}
                  </span>
                </td>
                <td className="text-center">
                  <button
                    className="btn btn-sm btn-outline-danger rounded-0" title="Eliminar"
                    onClick={() => handleEliminar(u.id)}
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
