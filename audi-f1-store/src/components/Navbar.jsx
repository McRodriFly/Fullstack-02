/* NavBar de la tienda: migración del <nav> de la EP1 a componente React.
   Usa NavLink para resaltar la ruta activa y useCarrito() para el contador. */
import { Link, NavLink } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

export default function Navbar() {
  const { cantidad } = useCarrito();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          AUDI <span className="text-danger">F1</span> STORE
        </Link>

        {/* Botón hamburguesa para móvil (responsivo con Bootstrap) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menuTienda"
          aria-controls="menuTienda"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="menuTienda">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/categorias">Categorías</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/ofertas">Ofertas</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/nosotros">Nosotros</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/blog">Noticias F1</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contacto">Contacto</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/login">Iniciar Sesión</NavLink>
            </li>
            {/* Carrito con contador: estado global gracias al contexto */}
            <li className="nav-item">
              <NavLink className="nav-link" to="/carrito">
                🛒{" "}
                <span
                  key={cantidad}
                  className="badge bg-danger badge-contador"
                  data-testid="contador-carrito"
                >
                  {cantidad}
                </span>
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
