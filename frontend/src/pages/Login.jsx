/* /login — inicio de sesión contra el backend (POST /api/v1/auth/login).
   Valida el formulario antes de enviarlo; el backend comprueba la contraseña y
   devuelve el rol, que decide a dónde se redirige (ver rutaInicialPara). */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validarLogin } from "../utils/validadores";
import { useAuth } from "../context/AuthContext";
import { rutaInicialPara } from "../utils/roles";

export default function Login() {
  const [datos, setDatos] = useState({ correo: "", password: "" });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const { iniciarSesion } = useAuth();

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const mensaje = validarLogin(datos);
    setError(mensaje);
    if (mensaje) return; // hay error: no continuar

    setEnviando(true);
    try {
      const usuario = await iniciarSesion(datos.correo.trim(), datos.password);
      navigate(rutaInicialPara(usuario));
    } catch (err) {
      // Credenciales incorrectas o servidor caído: el mensaje ya viene listo para mostrarse.
      setError(err.message);
      setEnviando(false);
    }
  }

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card border-0 shadow-sm p-4 p-md-5">
            <h2 className="fw-bold text-uppercase text-center mb-4">Iniciar Sesión</h2>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="correo" className="form-label">Correo electrónico</label>
                <input
                  type="email" id="correo" name="correo"
                  className="form-control rounded-0"
                  placeholder="ejemplo@duoc.cl"
                  value={datos.correo} onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  type="password" id="password" name="password"
                  className="form-control rounded-0"
                  value={datos.password} onChange={handleChange}
                />
              </div>

              {error && <div className="alert alert-danger rounded-0">{error}</div>}

              <button type="submit" className="btn btn-dark w-100 fw-bold py-2 rounded-0" disabled={enviando}>
                {enviando ? "INGRESANDO..." : "INGRESAR"}
              </button>
            </form>

            <p className="text-center text-muted mt-4 mb-0 small">
              ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
