/* Roles tal como los entrega el backend y qué puede ver cada uno. */
export const ROLES = {
  ADMIN: "ROLE_ADMIN",
  VENDEDOR: "ROLE_VENDEDOR",
  CLIENTE: "ROLE_CLIENTE",
};

/* Ruta de inicio tras iniciar sesión: el panel para administrador y vendedor,
   la tienda para el cliente. */
export function rutaInicialPara(usuario) {
  return usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.VENDEDOR ? "/admin" : "/";
}
