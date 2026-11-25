/* Layout de /admin: sidebar + <Outlet /> donde se renderiza cada subruta.
   Bajo md el sidebar pasa a barra superior y los enlaces se muestran con el
   botón MENÚ (estado menuAbierto); desde md siempre están visibles.
   El menú muestra solo las secciones que el rol puede ver (utils/roles.js); el
   acceso a cada ruta lo controla RutaProtegida en App.jsx. */
import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { PERMISOS, nombreDelRol, tieneRol } from "../../utils/roles";

// end en /admin: sin esto también quedaría activo en las subrutas.
const SECCIONES = [
  { ruta: "/admin", texto: "Resumen Paddock", icono: "bi-speedometer2", roles: PERMISOS.verResumen, end: true },
  { ruta: "/admin/productos", texto: "Productos", icono: "bi-box-seam-fill", roles: PERMISOS.verProductos },
  { ruta: "/admin/ordenes", texto: "Órdenes de Compra", icono: "bi-receipt", roles: PERMISOS.verOrdenes },
  { ruta: "/admin/usuarios", texto: "Mantenedor Usuarios", icono: "bi-people-fill", roles: PERMISOS.gestionarUsuarios },
];

export default function AdminLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  function salir() {
    cerrarSesion();
    navigate("/login");
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <nav className="col-md-3 col-lg-2 admin-sidebar px-0 bg-dark">
          <div className="admin-sidebar-inner pt-3 pt-md-4 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center px-3 mb-md-5">
              <div className="text-md-center flex-md-grow-1">
                <h4 className="text-white fw-bold mb-0">
                  AUDI <span className="text-danger">F1</span>
                </h4>
                <p className="text-secondary small mb-0">PANEL DE CONTROL</p>
                <p className="text-danger small fw-bold text-uppercase mb-0" data-testid="rol-panel">
                  {nombreDelRol(usuario.rol)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline-light btn-sm rounded-0 d-md-none"
                onClick={() => setMenuAbierto(!menuAbierto)}
                aria-expanded={menuAbierto}
                aria-controls="menuAdmin"
              >
                <i className="bi bi-list me-1"></i>MENÚ
              </button>
            </div>

            {/* d-none/d-flex aplica bajo md; d-md-flex lo deja siempre visible desde md */}
            <div
              id="menuAdmin"
              className={`flex-column flex-grow-1 mt-3 mt-md-0 ${menuAbierto ? "d-flex" : "d-none"} d-md-flex`}
            >
              <ul className="nav flex-column mb-auto">
                {SECCIONES.filter((s) => tieneRol(usuario, s.roles)).map((s) => (
                  <li className="nav-item" key={s.ruta}>
                    <NavLink end={s.end} className="nav-link text-uppercase py-3" to={s.ruta} onClick={cerrarMenu}>
                      <i className={`bi ${s.icono} me-2`}></i>{s.texto}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <ul className="nav flex-column mt-auto mb-4">
                <li className="nav-item text-secondary small px-3 pb-2" data-testid="usuario-panel">
                  <i className="bi bi-person-circle me-2"></i>
                  {usuario.nombre}
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-danger fw-bold text-uppercase py-3" to="/">
                    <i className="bi bi-box-arrow-left me-2"></i>Volver a la Tienda
                  </Link>
                </li>
                <li className="nav-item">
                  <button type="button" className="nav-link btn btn-link text-light text-uppercase py-3" onClick={salir}>
                    <i className="bi bi-power me-2"></i>Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <main className="col-md-9 ms-sm-auto col-lg-10 admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
