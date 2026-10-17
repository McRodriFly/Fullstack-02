/* NavBar de la tienda: migración del <nav> de la EP1 a componente React.
   - NavLink resalta la ruta activa.
   - useCarrito() entrega la cantidad de productos para el contador.
   - El menú hamburguesa (celular) se abre/cierra con estado de React
     (menuAbierto) en vez del JavaScript de Bootstrap. */
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useCarrito } from "../context/CarritoContext";

// Enlaces del menú: se recorren con map() para no repetir JSX
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
  // Estado local: si el menú está desplegado en pantallas pequeñas
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Al navegar a otra página cerramos el menú
  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-secondary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" onClick={cerrarMenu}>
          AUDI <span className="text-danger">F1</span> STORE
        </Link>

        {/* Botón hamburguesa: solo visible bajo 992px (navbar-expand-lg) */}
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

        {/* La clase "show" de Bootstrap despliega el menú colapsado */}
        <div className={`collapse navbar-collapse ${menuAbierto ? "show" : ""}`} id="menuTienda">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {ENLACES.map((enlace) => (
              <li className="nav-item" key={enlace.ruta}>
                <NavLink className="nav-link" to={enlace.ruta} end onClick={cerrarMenu}>
                  {enlace.texto}
                </NavLink>
              </li>
            ))}
            {/* Carrito con contador: estado global gracias al contexto */}
            <li className="nav-item">
              <NavLink className="nav-link" to="/carrito" onClick={cerrarMenu}>
                🛒{" "}
                {/* key={cantidad}: al cambiar la key React vuelve a crear el
                    <span>, lo que reinicia la animación CSS de "pulso" */}
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
