/* Página 404: se muestra cuando la URL no coincide con ninguna ruta
   (Route path="*" en App.jsx). Usa useLocation para mostrar la ruta pedida. */
import { Link, useLocation } from "react-router-dom";

export default function NoEncontrado() {
  const { pathname } = useLocation();

  return (
    <section className="container py-5 text-center">
      <div className="display-1 fw-bold text-danger">404</div>
      <h1 className="fw-bold text-uppercase">Página no encontrada</h1>
      <p className="text-muted">
        La ruta <code>{pathname}</code> no existe en la Audi F1 Store.
      </p>
      <Link to="/" className="btn btn-dark rounded-0 fw-bold mt-2">
        VOLVER AL CATÁLOGO
      </Link>
    </section>
  );
}
