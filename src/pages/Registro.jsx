/* /registro — alta de cliente con validación de RUT y selects región/comuna
   encadenados. El registro es simulado: si es válido, redirige a /login. */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validarRegistro } from "../utils/validadores";
import { datosUbicacion } from "../data/ubicacion";

const FORM_INICIAL = {
  rut: "",
  correo: "",
  nombre: "",
  apellidos: "",
  password: "",
  passwordConf: "",
  region: "",
  comuna: "",
};

export default function Registro() {
  const [datos, setDatos] = useState(FORM_INICIAL);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const comunasDisponibles =
    datosUbicacion.find((d) => d.region === datos.region)?.comunas || [];

  function handleChange(e) {
    const { name, value } = e.target;
    // Si cambia la región, la comuna anterior deja de ser válida.
    if (name === "region") {
      setDatos({ ...datos, region: value, comuna: "" });
    } else {
      setDatos({ ...datos, [name]: value });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const mensaje = validarRegistro(datos);
    setError(mensaje);
    if (mensaje) return;

    navigate("/login");
  }

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-7">
          <div className="card border-0 shadow-sm p-4 p-md-5">
            <h2 className="fw-bold text-uppercase text-center mb-4">Crear Cuenta</h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label htmlFor="rut" className="form-label">RUT (sin puntos ni guión)</label>
                  <input
                    type="text" id="rut" name="rut" placeholder="111111111"
                    className="form-control rounded-0"
                    value={datos.rut} onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="correo" className="form-label">Correo electrónico</label>
                  <input
                    type="email" id="correo" name="correo" placeholder="ejemplo@duoc.cl"
                    className="form-control rounded-0"
                    value={datos.correo} onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="nombre" className="form-label">Nombre</label>
                  <input
                    type="text" id="nombre" name="nombre"
                    className="form-control rounded-0"
                    value={datos.nombre} onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="apellidos" className="form-label">Apellidos</label>
                  <input
                    type="text" id="apellidos" name="apellidos"
                    className="form-control rounded-0"
                    value={datos.apellidos} onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    type="password" id="password" name="password"
                    className="form-control rounded-0"
                    value={datos.password} onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="passwordConf" className="form-label">Confirmar contraseña</label>
                  <input
                    type="password" id="passwordConf" name="passwordConf"
                    className="form-control rounded-0"
                    value={datos.passwordConf} onChange={handleChange}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="region" className="form-label">Región</label>
                  <select
                    id="region" name="region" className="form-select rounded-0"
                    value={datos.region} onChange={handleChange}
                  >
                    <option value="">-- Seleccione región --</option>
                    {datosUbicacion.map((d) => (
                      <option key={d.region} value={d.region}>{d.region}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label htmlFor="comuna" className="form-label">Comuna</label>
                  <select
                    id="comuna" name="comuna" className="form-select rounded-0"
                    value={datos.comuna} onChange={handleChange}
                    disabled={comunasDisponibles.length === 0}
                  >
                    <option value="">-- Seleccione comuna --</option>
                    {comunasDisponibles.map((comuna) => (
                      <option key={comuna} value={comuna}>{comuna}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <div className="alert alert-danger rounded-0 mt-4">{error}</div>}

              <button type="submit" className="btn btn-dark w-100 fw-bold py-2 rounded-0 mt-4">
                REGISTRARSE
              </button>
            </form>

            <p className="text-center text-muted mt-4 mb-0 small">
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
