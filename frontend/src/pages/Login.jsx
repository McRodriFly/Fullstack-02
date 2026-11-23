/* Vista de Login: formulario con validación React (estado controlado).
   Migrado de views_tienda/login.html + js/validaciones.js.
   Si el correo contiene "admin" redirige al panel de administración. */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAPI } from "../services/api";

export default function Login() {
  // Estado controlado del formulario (requisito IE2.1.2)
  const [datos, setDatos] = useState({ correo: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!datos.correo || !datos.password) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    // Llamada REST al Backend Spring Boot con JWT
    const resultado = await loginAPI(datos.correo, datos.password);

    if (!resultado.success) {
      setError(resultado.message);
      return;
    }

    // Guardar sesión y token JWT (persistencia ante recargas de página)
    localStorage.setItem("tokenJWT", resultado.usuario.token);
    localStorage.setItem("usuarioLogueado", JSON.stringify(resultado.usuario));

    // Restricción de acceso basada en roles (Pauta EP3)
    if (resultado.usuario.rol === "ROLE_ADMIN" || resultado.usuario.rol === "ROLE_VENDEDOR") {
      navigate("/admin");
    } else {
      navigate("/");
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

              {/* Mensaje de error: solo se muestra cuando hay uno */}
              {error && <div className="alert alert-danger rounded-0">{error}</div>}

              <button type="submit" className="btn btn-dark w-100 fw-bold py-2 rounded-0">
                INGRESAR
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
