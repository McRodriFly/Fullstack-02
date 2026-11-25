/* Cliente HTTP de la API REST del backend (Spring Boot, /api/v1).

   - Agrega "Authorization: Bearer <token de acceso>" si hay sesión.
   - Si el token de acceso venció (o el backend responde 401), lo renueva una sola
     vez con el token de refresco y repite la solicitud. Si varias solicitudes lo
     necesitan a la vez, todas esperan el mismo refresco.
   - Si el refresco también falla, cierra la sesión.
   - Todo error llega como ErrorApi, con el mensaje en español que envía el backend. */
import { borrarSesion, guardarSesion, leerSesion, tokenVencido } from "./sesion";

// Se puede cambiar con VITE_API_URL en un .env del frontend. Fuera de la cobertura:
// el valor depende de cómo se compila, no del código.
/* istanbul ignore next */
export const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:8080/api/v1";

const MENSAJE_SIN_CONEXION = "No se pudo conectar con el servidor. Inténtalo de nuevo en unos minutos.";
const MENSAJE_SESION_EXPIRADA = "Tu sesión expiró; vuelve a iniciar sesión.";

export class ErrorApi extends Error {
  /* estado: código HTTP (0 si no hubo respuesta); detalles: errores por campo. */
  constructor(estado, mensaje, detalles = []) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.detalles = detalles;
  }
}

// Refresco en curso, compartido por las solicitudes que lleguen mientras tanto.
let refrescoEnCurso = null;

/* Solicitud genérica. opciones: { metodo = "GET", cuerpo }. Devuelve el JSON de la
   respuesta, o null si no tiene contenido (204). */
export async function pedir(ruta, { metodo = "GET", cuerpo } = {}) {
  let sesion = leerSesion();
  if (sesion && tokenVencido(sesion.tokenAcceso)) {
    sesion = await refrescar();
  }

  let respuesta = await enviar(ruta, metodo, cuerpo, sesion?.tokenAcceso);

  // El token pudo vencer o invalidarse entre la comprobación y la respuesta.
  if (respuesta.status === 401 && sesion) {
    sesion = await refrescar();
    respuesta = await enviar(ruta, metodo, cuerpo, sesion.tokenAcceso);
    if (respuesta.status === 401) {
      borrarSesion();
    }
  }

  return leerRespuesta(respuesta);
}

export const api = {
  get: (ruta) => pedir(ruta),
  post: (ruta, cuerpo) => pedir(ruta, { metodo: "POST", cuerpo }),
  put: (ruta, cuerpo) => pedir(ruta, { metodo: "PUT", cuerpo }),
  eliminar: (ruta) => pedir(ruta, { metodo: "DELETE" }),
};

/* Inicio de sesión y registro: guardan la sesión que devuelve el backend. */
export async function iniciarSesionApi(correo, contrasena) {
  const sesion = await leerRespuesta(await enviar("/auth/login", "POST", { correo, contrasena }));
  guardarSesion(sesion);
  return sesion;
}

export async function registrarApi({ nombre, correo, contrasena }) {
  const sesion = await leerRespuesta(await enviar("/auth/registro", "POST", { nombre, correo, contrasena }));
  guardarSesion(sesion);
  return sesion;
}

/* Canjea el token de refresco por un par nuevo. Si el backend lo rechaza, la sesión
   ya no se puede renovar y se cierra; si solo falló la red, se conserva. */
function refrescar() {
  if (!refrescoEnCurso) {
    refrescoEnCurso = (async () => {
      const actual = leerSesion();
      if (!actual) {
        throw new ErrorApi(401, MENSAJE_SESION_EXPIRADA);
      }
      const respuesta = await enviar("/auth/refresh", "POST", { tokenRefresco: actual.tokenRefresco });
      if (respuesta.status === 401) {
        borrarSesion();
        throw new ErrorApi(401, MENSAJE_SESION_EXPIRADA);
      }
      const nueva = await leerRespuesta(respuesta);
      guardarSesion(nueva);
      return nueva;
    })().finally(() => {
      refrescoEnCurso = null;
    });
  }
  return refrescoEnCurso;
}

async function enviar(ruta, metodo, cuerpo, token) {
  const encabezados = {};
  if (cuerpo !== undefined) encabezados["Content-Type"] = "application/json";
  if (token) encabezados.Authorization = `Bearer ${token}`;
  try {
    return await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi(0, MENSAJE_SIN_CONEXION);
  }
}

async function leerRespuesta(respuesta) {
  if (respuesta.status === 204) return null;
  // Un error sin cuerpo JSON (por ejemplo, de un proxy) también se reporta.
  const datos = await respuesta.json().catch(() => null);
  if (respuesta.ok) return datos;
  throw new ErrorApi(
    respuesta.status,
    datos?.mensaje || `Error ${respuesta.status} al comunicarse con el servidor.`,
    datos?.detalles || []
  );
}
