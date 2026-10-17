/* Layout del panel de administración: sidebar + contenido.
   Las sub-vistas (/admin, /admin/productos, /admin/usuarios) se
   renderizan dentro del <Outlet />. Migrado de views_admin/*.html

   Responsivo: en celular el sidebar se convierte en una barra superior
   con un botón "MENÚ" que abre/cierra los enlaces (estado menuAbierto).
   Desde 768px (md) los enlaces siempre están visibles en la columna lateral. */
import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  // Estado local: si el menú está desplegado en pantallas pequeñas
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Al elegir una opción en celular, cerramos el menú
  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 admin-sidebar px-0 bg-dark">
          <div className="admin-sidebar-inner pt-3 pt-md-4 d-flex flex-column">
            <div className="d-flex justify-content-between align-items-center px-3 mb-md-5">
              <div className="text-md-center flex-md-grow-1">
                <h4 className="text-white fw-bold mb-0">
                  AUDI <span className="text-danger">F1</span>
                </h4>
                <p className="text-secondary small mb-0">PANEL DE CONTROL</p>
              </div>
              {/* Botón solo visible en celular (d-md-none) */}
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

            {/* d-none oculta en celular si está cerrado; d-md-flex lo muestra siempre en md+ */}
            <div
              id="menuAdmin"
              className={`flex-column flex-grow-1 mt-3 mt-md-0 ${menuAbierto ? "d-flex" : "d-none"} d-md-flex`}
            >
              <ul className="nav flex-column mb-auto">
                <li className="nav-item">
                  {/* 'end' para que solo se active en la ruta exacta */}
                  <NavLink end className="nav-link text-uppercase py-3" to="/admin" onClick={cerrarMenu}>
                    <i className="bi bi-speedometer2 me-2"></i>Resumen Paddock
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-uppercase py-3" to="/admin/productos" onClick={cerrarMenu}>
                    <i className="bi bi-box-seam-fill me-2"></i>Mantenedor Productos
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link text-uppercase py-3" to="/admin/usuarios" onClick={cerrarMenu}>
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
          </div>
        </nav>

        {/* Contenido principal: aquí se inyecta cada sub-vista */}
        <main className="col-md-9 ms-sm-auto col-lg-10 admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
