/* Sesión del usuario guardada en localStorage: sobrevive a recargas de página.
   Guarda el token de acceso, el de refresco y los datos del usuario que entrega
   el backend. Quien necesite enterarse de los cambios (AuthContext) se suscribe. */
const CLAVE = "audi_f1_sesion";

const suscriptores = new Set();

/* Lee el campo "exp" (segundos desde 1970) del contenido de un JWT. No verifica la
   firma: eso lo hace el backend; aquí solo sirve para no usar un token ya vencido. */
export function tokenVencido(token, ahora = Date.now()) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(base64));
    return typeof exp !== "number" || exp * 1000 <= ahora;
  } catch {
    // Un token mal formado se trata como vencido.
    return true;
  }
}

/* Devuelve { tokenAcceso, tokenRefresco, usuario } o null si no hay sesión.
   Si el token de refresco ya venció, la sesión no se puede renovar y se descarta. */
export function leerSesion() {
  let sesion = null;
  try {
    sesion = JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    // Valor corrupto: se descarta abajo, igual que uno incompleto.
  }
  const valida = sesion?.tokenAcceso && sesion?.usuario && !tokenVencido(sesion?.tokenRefresco);
  if (!valida) {
    localStorage.removeItem(CLAVE);
    return null;
  }
  return sesion;
}

/* Recibe la respuesta de /auth/login, /auth/registro o /auth/refresh. */
export function guardarSesion({ tokenAcceso, tokenRefresco, usuario }) {
  const sesion = { tokenAcceso, tokenRefresco, usuario };
  localStorage.setItem(CLAVE, JSON.stringify(sesion));
  avisar(sesion);
}

export function borrarSesion() {
  localStorage.removeItem(CLAVE);
  avisar(null);
}

/* Registra una función que recibe la sesión nueva (o null) en cada cambio.
   Devuelve la función que cancela la suscripción. */
export function suscribirSesion(fn) {
  suscriptores.add(fn);
  return () => suscriptores.delete(fn);
}

function avisar(sesion) {
  suscriptores.forEach((fn) => fn(sesion));
}
