/* /admin/usuarios — CRUD de usuarios contra la API (/api/v1/usuarios), solo administrador.
   El mismo formulario sirve para crear y editar: idEditando === null es "crear".
   Al editar, la contraseña es opcional: vacía conserva la actual. El backend impide
   que un administrador se quite su propio rol o elimine su cuenta, y que se borre un
   usuario con compras; esos avisos se muestran tal cual. */
import { useState } from "react";
import EstadoConsulta from "../../components/EstadoConsulta";
import { useConsultaApi } from "../../hooks/useConsultaApi";
import { api, describirError } from "../../services/api";
import { ROLES, nombreDelRol } from "../../utils/roles";

const FORM_INICIAL = { nombre: "", correo: "", contrasena: "", rol: ROLES.CLIENTE };

const COLOR_ROL = {
  [ROLES.ADMIN]: "bg-danger",
  [ROLES.VENDEDOR]: "bg-warning text-dark",
  [ROLES.CLIENTE]: "bg-secondary",
};

export default function AdminUsuarios() {
  const { datos: usuarios, error: errorLista, cargando, recargar } = useConsultaApi("/usuarios");
  const [form, setForm] = useState(FORM_INICIAL);
  const [idEditando, setIdEditando] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEditar(usuario) {
    setIdEditando(usuario.id);
    setForm({ nombre: usuario.nombre, correo: usuario.correo, contrasena: "", rol: usuario.rol });
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelar() {
    setIdEditando(null);
    setForm(FORM_INICIAL);
    setError("");
  }

  async function handleEliminar(id) {
    if (!window.confirm("¿Eliminar este usuario?")) return;
    try {
      await api.eliminar(`/usuarios/${id}`);
      setError("");
      recargar();
    } catch (err) {
      setError(describirError(err));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.correo.trim()) return setError("Nombre y correo son obligatorios.");
    if (idEditando === null && form.contrasena.length < 4) {
      return setError("La contraseña debe tener al menos 4 caracteres.");
    }
    setError("");

    const cuerpo = {
      nombre: form.nombre.trim(),
      correo: form.correo.trim(),
      // Vacía al editar = conservar la actual (el backend espera null, no "").
      contrasena: form.contrasena || null,
      rol: form.rol,
    };
    setGuardando(true);
    try {
      if (idEditando === null) {
        await api.post("/usuarios", cuerpo);
      } else {
        await api.put(`/usuarios/${idEditando}`, cuerpo);
      }
      handleCancelar();
      recargar();
    } catch (err) {
      // Por ejemplo, 409 si el correo ya está registrado.
      setError(describirError(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <header className="pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 className="h2 fw-bold text-uppercase">Usuarios</h1>
      </header>

      <div className="card border-0 shadow-sm rounded-0 mb-5">
        <div className="card-header bg-dark text-white rounded-0 py-3">
          <h5 className="mb-0 fw-bold text-uppercase small">
            <i className="bi bi-person-plus-fill me-2"></i>
            {idEditando === null ? "Nuevo usuario" : `Editando usuario #${idEditando}`}
          </h5>
        </div>
        <div className="card-body p-4 bg-white">
          {error && <div className="alert alert-danger rounded-0 border-0">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label text-uppercase fw-bold small">Nombre</label>
                <input
                  type="text" name="nombre" className="form-control rounded-0"
                  value={form.nombre} onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label text-uppercase fw-bold small">Correo</label>
                <input
                  type="email" name="correo" className="form-control rounded-0"
                  value={form.correo} onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label text-uppercase fw-bold small">
                  {idEditando === null ? "Contraseña" : "Nueva contraseña (opcional)"}
                </label>
                <input
                  type="password" name="contrasena" className="form-control rounded-0"
                  autoComplete="new-password" value={form.contrasena} onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label text-uppercase fw-bold small">Rol</label>
                <select name="rol" className="form-select rounded-0" value={form.rol} onChange={handleChange}>
                  {Object.values(ROLES).map((rol) => (
                    <option key={rol} value={rol}>{nombreDelRol(rol)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-3 text-end">
              <button type="button" onClick={handleCancelar} className="btn btn-outline-secondary rounded-0 fw-bold me-2 px-4">
                CANCELAR
              </button>
              <button type="submit" className="btn btn-dark rounded-0 fw-bold px-4" disabled={guardando}>
                {idEditando === null ? "AGREGAR" : "ACTUALIZAR"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <EstadoConsulta cargando={cargando} error={errorLista} textoCarga="Cargando usuarios..." />
      {usuarios && (
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
                    <span className={`badge ${COLOR_ROL[u.rol]}`}>{nombreDelRol(u.rol).toUpperCase()}</span>
                  </td>
                  <td className="text-center text-nowrap">
                    <button
                      className="btn btn-sm btn-outline-dark rounded-0 me-1" title="Editar"
                      onClick={() => handleEditar(u)}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
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
      )}
    </>
  );
}
