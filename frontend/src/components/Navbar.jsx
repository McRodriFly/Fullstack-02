/* Menú principal de la tienda. El colapso en pantallas < lg se maneja con el
   estado menuAbierto (clase "show" de Bootstrap) en vez de data-bs-toggle,
   para que React controle el DOM y el comportamiento sea testeable. */
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

const ENLACES = [
  { ruta: "/", texto: "Home" },
  { ruta: "/categorias", texto: "Categorías" },
  { ruta: "/ofertas", texto: "Ofertas" },
  { ruta: "/nosotros", texto: "Nosotros" },
  { ruta: "/blog", texto: "Noticias F1" },
  { ruta: "/contacto", texto: "Contacto" },
  { ruta: "/login", texto: "Iniciar Sesión" },
];

export default function Navbar() {
  const { cantidad } = useCarrito();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Se llama en cada enlace para que el menú móvil se cierre al navegar.
  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" onClick={cerrarMenu}>
          AUDI <span className="text-danger">F1</span> STORE
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-controls="menuTienda"
          aria-expanded={menuAbierto}
          aria-label="Abrir menú"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${menuAbierto ? "show" : ""}`} id="menuTienda">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {ENLACES.map((enlace) => (
              <li className="nav-item" key={enlace.ruta}>
                <NavLink className="nav-link" to={enlace.ruta} end onClick={cerrarMenu}>
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
            <li className="nav-item">
              <NavLink className="nav-link" to="/carrito" onClick={cerrarMenu}>
                🛒{" "}
                {/* key={cantidad} fuerza a remontar el <span> y así reinicia la animación badge-pulso */}
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
