/* Guardia de rutas según la sesión y el rol.
   - Sin sesión: lleva a /login y recuerda la ruta pedida para volver después.
   - Con sesión pero sin el rol: muestra "Acceso denegado", o redirige a
     "siNoPermitido" si se indica (por ejemplo, el vendedor que entra a /admin).
   Si la sesión vence mientras se navega, AuthContext deja al usuario en null y
   esta guardia lo lleva al login en el siguiente render. */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { tieneRol } from "../utils/roles";
import AccesoDenegado from "../pages/AccesoDenegado";

export default function RutaProtegida({ roles, siNoPermitido, children }) {
  const { usuario } = useAuth();
  const { pathname, search } = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: pathname + search }} />;
  }
  if (!tieneRol(usuario, roles)) {
    return siNoPermitido ? <Navigate to={siNoPermitido} replace /> : <AccesoDenegado />;
  }
  // Como envoltorio de un elemento o como ruta padre de otras (<Outlet />).
  return children ?? <Outlet />;
}
