/* Página 403: hay sesión, pero el rol no permite ver la ruta pedida. */
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { nombreDelRol, rutaInicialPara } from "../utils/roles";

export default function AccesoDenegado() {
  const { usuario } = useAuth();

  return (
    <section className="container py-5 text-center">
      <div className="display-1 fw-bold text-danger">403</div>
      <h1 className="fw-bold text-uppercase">Acceso denegado</h1>
      <p className="text-muted">
        Tu rol (<strong>{nombreDelRol(usuario.rol)}</strong>) no tiene permiso para ver esta página.
      </p>
      <Link to={rutaInicialPara(usuario)} className="btn btn-dark rounded-0 fw-bold mt-2">
        IR A MI INICIO
      </Link>
    </section>
  );
}
