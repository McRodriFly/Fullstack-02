/* Layout de /admin: sidebar + <Outlet /> donde se renderiza cada subruta.
   Bajo md el sidebar pasa a barra superior y los enlaces se muestran con el
   botón MENÚ (estado menuAbierto); desde md siempre están visibles. */
import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";

export default function AdminLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  function cerrarMenu() {
    setMenuAbierto(false);
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
                <li className="nav-item">
                  {/* end: sin esto también quedaría activo en /admin/productos y /admin/usuarios */}
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

        <main className="col-md-9 ms-sm-auto col-lg-10 admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
