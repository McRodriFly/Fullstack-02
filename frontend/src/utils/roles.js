/* Roles tal como los entrega el backend y qué puede hacer cada uno en el frontend.
   El backend vuelve a comprobar cada permiso: esto decide qué se muestra, no qué
   se permite. */
export const ROLES = {
  ADMIN: "ROLE_ADMIN",
  VENDEDOR: "ROLE_VENDEDOR",
  CLIENTE: "ROLE_CLIENTE",
};

const { ADMIN, VENDEDOR, CLIENTE } = ROLES;

/* Matriz de permisos. El vendedor solo ve la lista y el detalle de productos y
   de órdenes; el administrador tiene acceso total; el cliente solo usa la tienda. */
export const PERMISOS = {
  entrarAlPanel: [ADMIN, VENDEDOR],
  verResumen: [ADMIN],
  verProductos: [ADMIN, VENDEDOR],
  gestionarProductos: [ADMIN],
  gestionarCategorias: [ADMIN],
  verOrdenes: [ADMIN, VENDEDOR],
  gestionarUsuarios: [ADMIN],
  comprar: [ADMIN, CLIENTE],
};

/* ¿El usuario (o null si no hay sesión) tiene alguno de los roles indicados? */
export function tieneRol(usuario, roles) {
  return usuario !== null && roles.includes(usuario.rol);
}

/* El carrito se arma sin sesión (se exige iniciarla recién al pagar), así que lo ven
   los visitantes y los roles que pueden comprar. Para el vendedor no aparece. */
export function puedeUsarCarrito(usuario) {
  return usuario === null || tieneRol(usuario, PERMISOS.comprar);
}

/* Ruta de inicio tras iniciar sesión: el administrador va al resumen del panel,
   el vendedor a los productos (no ve el resumen) y el cliente a la tienda. */
export function rutaInicialPara(usuario) {
  if (usuario.rol === ADMIN) return "/admin";
  if (usuario.rol === VENDEDOR) return "/admin/productos";
  return "/";
}

export function nombreDelRol(rol) {
  return { [ADMIN]: "Administrador", [VENDEDOR]: "Vendedor", [CLIENTE]: "Cliente" }[rol];
}
