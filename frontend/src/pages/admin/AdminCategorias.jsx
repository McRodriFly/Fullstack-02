/* /admin/categorias — CRUD de categorías contra la API (/api/v1/categorias), solo administrador.
   El mismo formulario sirve para crear y renombrar: idEditando === null es "crear".
   El backend rechaza con 409 un nombre repetido y la eliminación de una categoría que
   todavía tiene productos; esos avisos se muestran tal cual. */
import { useState } from "react";
import EstadoConsulta from "../../components/EstadoConsulta";
import { useConsultaApi } from "../../hooks/useConsultaApi";
import { api, describirError } from "../../services/api";

const LARGO_MAXIMO = 60;

export default function AdminCategorias() {
  const { datos: categorias, error: errorLista, cargando, recargar } = useConsultaApi("/categorias");
  const [nombre, setNombre] = useState("");
  const [idEditando, setIdEditando] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function handleEditar(categoria) {
    setIdEditando(categoria.id);
    setNombre(categoria.nombre);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelar() {
    setIdEditando(null);
    setNombre("");
    setError("");
  }

  async function handleEliminar(categoria) {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    try {
      await api.eliminar(`/categorias/${categoria.id}`);
      setError("");
      recargar();
    } catch (err) {
      // Por ejemplo, 409 si todavía tiene productos.
      setError(describirError(err));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const limpio = nombre.trim();
    if (!limpio) return setError("El nombre es obligatorio.");
    if (limpio.length > LARGO_MAXIMO) {
      return setError(`El nombre no puede superar los ${LARGO_MAXIMO} caracteres.`);
    }
    setError("");

    setGuardando(true);
    try {
      if (idEditando === null) {
        await api.post("/categorias", { nombre: limpio });
      } else {
        await api.put(`/categorias/${idEditando}`, { nombre: limpio });
      }
      handleCancelar();
      recargar();
    } catch (err) {
      // Por ejemplo, 409 si ya existe una categoría con ese nombre.
      setError(describirError(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <header className="pt-3 pb-2 mb-4 border-bottom border-secondary">
        <h1 className="h2 fw-bold text-uppercase">Categorías</h1>
      </header>

      <div className="card border-0 shadow-sm rounded-0 mb-5">
        <div className="card-header bg-dark text-white rounded-0 py-3">
          <h5 className="mb-0 fw-bold text-uppercase small">
            <i className="bi bi-tag-fill me-2"></i>
            {idEditando === null ? "Nueva categoría" : `Editando categoría #${idEditando}`}
          </h5>
        </div>
        <div className="card-body p-4 bg-white">
          {error && <div className="alert alert-danger rounded-0 border-0">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label text-uppercase fw-bold small" htmlFor="nombreCategoria">Nombre</label>
                <input
                  type="text" id="nombreCategoria" name="nombre" className="form-control rounded-0"
                  placeholder="Ej: Gorras" value={nombre} onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="col-md-6 text-md-end">
                <button type="button" onClick={handleCancelar} className="btn btn-outline-secondary rounded-0 fw-bold me-2 px-4">
                  CANCELAR
                </button>
                <button type="submit" className="btn btn-dark rounded-0 fw-bold px-4" disabled={guardando}>
                  {idEditando === null ? "AGREGAR" : "ACTUALIZAR"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <EstadoConsulta cargando={cargando} error={errorLista} textoCarga="Cargando categorías..." />
      {categorias && (
        <div className="table-responsive bg-white shadow-sm border-0 mb-5">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-dark">
              <tr className="text-uppercase small">
                <th>ID</th><th>Nombre</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id}>
                  <td className="fw-bold text-muted">{c.id}</td>
                  <td className="fw-bold">{c.nombre}</td>
                  <td className="text-center text-nowrap">
                    <button
                      className="btn btn-sm btn-outline-dark rounded-0 me-1" title="Editar"
                      onClick={() => handleEditar(c)}
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-0" title="Eliminar"
                      onClick={() => handleEliminar(c)}
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
