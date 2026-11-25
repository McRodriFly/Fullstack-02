/* Menú principal de la tienda. El colapso en pantallas < lg se maneja con el
   estado menuAbierto (clase "show" de Bootstrap) en vez de data-bs-toggle,
   para que React controle el DOM y el comportamiento sea testeable.
   Con sesión iniciada muestra el nombre del usuario y el botón para salir. El
   enlace del carrito no se muestra al vendedor. */
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";
import { useAuth } from "../context/AuthContext";
import { PERMISOS, puedeUsarCarrito, rutaInicialPara, tieneRol } from "../utils/roles";

const ENLACES = [
  { ruta: "/", texto: "Home" },
  { ruta: "/categorias", texto: "Categorías" },
  { ruta: "/ofertas", texto: "Ofertas" },
  { ruta: "/nosotros", texto: "Nosotros" },
  { ruta: "/blog", texto: "Noticias F1" },
  { ruta: "/contacto", texto: "Contacto" },
];

export default function Navbar() {
  const { cantidad } = useCarrito();
  const { usuario, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();

  // Se llama en cada enlace para que el menú móvil se cierre al navegar.
  function cerrarMenu() {
    setMenuAbierto(false);
  }

  function salir() {
    cerrarSesion();
    cerrarMenu();
    navigate("/");
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
            {tieneRol(usuario, PERMISOS.entrarAlPanel) && (
              <li className="nav-item">
                <NavLink className="nav-link" to={rutaInicialPara(usuario)} onClick={cerrarMenu}>
                  <i className="bi bi-speedometer2 me-1"></i>Panel
                </NavLink>
              </li>
            )}
            {usuario ? (
              <>
                <li className="nav-item">
                  <span className="nav-link text-light" data-testid="usuario-conectado">
                    <i className="bi bi-person-circle me-1"></i>
                    {usuario.nombre}
                  </span>
                </li>
                <li className="nav-item">
                  <button type="button" className="nav-link btn btn-link" onClick={salir}>
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <NavLink className="nav-link" to="/login" end onClick={cerrarMenu}>
                  Iniciar Sesión
                </NavLink>
              </li>
            )}
            {puedeUsarCarrito(usuario) && (
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
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
