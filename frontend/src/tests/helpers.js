/* Utilidades compartidas por los specs: datos de prueba, un render que replica el
   árbol de la app (MemoryRouter + AuthProvider + CarritoProvider) y un backend
   simulado con jasmine.spyOn sobre window.fetch. */
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CarritoProvider } from "../context/CarritoContext";
import { AuthProvider } from "../context/AuthContext";

// Le indica a React que corre en un entorno de pruebas (habilita act()).
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

export const gorra = {
  id: 3, nombre: "Gorra Negra Audi F1", categoria: "Gorras",
  precio: 35000, archivo: "Gorra1.jpeg", stock: 25, oferta: false, precioOferta: 0,
};

// precio ya rebajado, tal como lo guarda el carrito
export const conjunto = {
  id: 2, nombre: "Conjunto Deportivo F1", categoria: "Ropa",
  precio: 69000, archivo: "Conjunto_1.jpeg", stock: 15, oferta: true, precioOferta: 69000,
};

export function guardarCarrito(productos) {
  localStorage.setItem("carritoTienda", JSON.stringify(productos));
}

export function renderConTienda(ui, ruta = "/") {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <CarritoProvider>{ui}</CarritoProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

/* ---------- Sesión y backend simulados ---------- */

export const CLAVE_SESION = "audi_f1_sesion";

export const USUARIOS = {
  admin: { id: 1, nombre: "Administrador", correo: "admin@duoc.cl", rol: "ROLE_ADMIN" },
  vendedor: { id: 2, nombre: "Vendedor", correo: "vendedor@duoc.cl", rol: "ROLE_VENDEDOR" },
  cliente: { id: 3, nombre: "Cliente", correo: "cliente@gmail.com", rol: "ROLE_CLIENTE" },
};

/* JWT con el "exp" indicado (segundos desde ahora; negativo = vencido). La firma es
   falsa: el frontend no la verifica, solo lee el vencimiento. */
export function tokenDePrueba(venceEnSegundos = 900, extra = "") {
  const contenido = { exp: Math.floor(Date.now() / 1000) + venceEnSegundos, extra };
  const base64Url = btoa(JSON.stringify(contenido)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `eyJhbGciOiJIUzI1NiJ9.${base64Url}.firma`;
}

/* Respuesta de /auth/login, /auth/registro o /auth/refresh. */
export function respuestaSesion(usuario, { acceso = tokenDePrueba(900, "a"), refresco = tokenDePrueba(604800, "r") } = {}) {
  return { tokenAcceso: acceso, tokenRefresco: refresco, tipoToken: "Bearer", expiraEn: 900, usuario };
}

/* Deja una sesión guardada, como si el usuario hubiera iniciado sesión antes de recargar. */
export function guardarSesionDePrueba(usuario, opciones) {
  const { tokenAcceso, tokenRefresco } = respuestaSesion(usuario, opciones);
  localStorage.setItem(CLAVE_SESION, JSON.stringify({ tokenAcceso, tokenRefresco, usuario }));
}

export function respuestaJson(estado, cuerpo) {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status: estado,
    headers: { "Content-Type": "application/json" },
  });
}

export function errorApi(estado, mensaje, detalles = []) {
  return respuestaJson(estado, { estado, mensaje, detalles, ruta: "", error: "" });
}

/* Reemplaza window.fetch. "rutas" asocia "MÉTODO /ruta" a una función que recibe
   { cuerpo, token } y devuelve una Response. Una ruta no declarada falla la prueba. */
export function simularBackend(rutas) {
  return spyOn(window, "fetch").and.callFake(async (url, opciones = {}) => {
    const ruta = url.replace(/^https?:\/\/[^/]+\/api\/v1/, "");
    const clave = `${opciones.method || "GET"} ${ruta}`;
    const manejador = rutas[clave];
    if (!manejador) throw new Error(`Solicitud no simulada: ${clave}`);
    const token = opciones.headers?.Authorization?.replace("Bearer ", "");
    const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined;
    return manejador({ cuerpo, token, opciones });
  });
}
