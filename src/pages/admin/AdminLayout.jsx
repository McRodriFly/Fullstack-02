/* Layout del panel de administración: sidebar + contenido.
   Las sub-vistas (/admin, /admin/productos, /admin/usuarios) se
   renderizan dentro del <Outlet />. Migrado de views_admin/*.html */
import { NavLink, Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 d-md-block admin-sidebar sidebar px-0 bg-dark">
          <div className="pt-4 d-flex flex-column vh-100 position-sticky top-0">
            <div className="text-center mb-5 px-3">
              <h4 className="text-white fw-bold mb-0">
                AUDI <span className="text-danger">F1</span>
              </h4>
              <p className="text-secondary small mb-0">PANEL DE CONTROL</p>
            </div>

            <ul className="nav flex-column mb-auto">
              <li className="nav-item">
                {/* 'end' para que solo se active en la ruta exacta */}
                <NavLink end className="nav-link text-uppercase py-3" to="/admin">
                  <i className="bi bi-speedometer2 me-2"></i>Resumen Paddock
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-uppercase py-3" to="/admin/productos">
                  <i className="bi bi-box-seam-fill me-2"></i>Mantenedor Productos
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link text-uppercase py-3" to="/admin/usuarios">
                  <i className="bi bi-people-fill me-2"></i>Mantenedor Usuarios
                </NavLink>
              </li>
            </ul>

            <ul className="nav flex-column mt-auto mb-4">
              <li className="nav-item">
                <Link className="nav-link text-danger fw-bold text-uppercase py-3" to="/">
                  <i className="bi bi-box-arrow-left me-2"></i>Volver a la Tienda
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Contenido principal: aquí se inyecta cada sub-vista */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
