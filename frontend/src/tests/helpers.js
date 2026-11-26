/* Utilidades compartidas por los specs: datos de prueba, un render que replica el
   árbol de la app (MemoryRouter + AuthProvider + CarritoProvider) y un backend
   simulado con jasmine.spyOn sobre window.fetch. */
import { render, waitFor } from "@testing-library/react";
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

/* Reemplaza window.fetch. "rutas" asocia "MÉTODO /ruta" (con :parametros opcionales,
   por ejemplo "GET /productos/:id") a una función que recibe { cuerpo, token, params }
   y devuelve una Response. Una ruta no declarada falla la prueba.
   Si ya hay un simulador activo en la prueba, las rutas nuevas se suman o reemplazan
   a las anteriores: así un beforeEach puede dejar el catálogo y cada prueba agregar
   el resto. */
export function simularBackend(rutas) {
  const espia = jasmine.isSpy(window.fetch) ? window.fetch : spyOn(window, "fetch");
  espia.rutas = { ...espia.rutas, ...rutas };
  return espia.and.callFake(async (url, opciones = {}) => {
    const ruta = url.replace(/^https?:\/\/[^/]+\/api\/v1/, "");
    const clave = `${opciones.method || "GET"} ${ruta}`;
    const { manejador, params } = buscarRuta(espia.rutas, clave);
    const token = opciones.headers?.Authorization?.replace("Bearer ", "");
    const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined;
    return manejador({ cuerpo, token, params, opciones });
  });
}

function buscarRuta(rutas, clave) {
  if (rutas[clave]) return { manejador: rutas[clave], params: {} };
  for (const patron of Object.keys(rutas).filter((r) => r.includes(":"))) {
    const regex = new RegExp("^" + patron.replace(/:(\w+)/g, "(?<$1>[^/]+)") + "$");
    const coincidencia = regex.exec(clave);
    if (coincidencia) return { manejador: rutas[patron], params: coincidencia.groups };
  }
  throw new Error(`Solicitud no simulada: ${clave}`);
}

/* ---------- Catálogo y usuarios simulados (en memoria) ---------- */

export const CATEGORIAS_API = [
  { id: 1, nombre: "Chaquetas" },
  { id: 2, nombre: "Ropa" },
  { id: 3, nombre: "Gorras" },
  { id: 4, nombre: "Accesorios" },
  { id: 5, nombre: "Poleras" },
];

function productoApi(id, nombre, categoriaId, precio, imagen, stock, precioOferta = null) {
  const categoria = CATEGORIAS_API.find((c) => c.id === categoriaId).nombre;
  return {
    id, nombre, categoriaId, categoria, precio, precioOferta,
    oferta: precioOferta !== null, precioVigente: precioOferta ?? precio, imagen, stock,
  };
}

// El catálogo inicial del backend (migración V5): 12 productos, 4 en oferta.
export function productosIniciales() {
  return [
    productoApi(1, "Chaqueta Oficial F1", 1, 120000, "Chaqueta_1.jpeg", 10),
    productoApi(2, "Conjunto Deportivo F1", 2, 85000, "Conjunto_1.jpeg", 15, 69000),
    productoApi(3, "Gorra Negra Audi F1", 3, 35000, "Gorra1.jpeg", 25),
    productoApi(4, "Gorra Edición Especial", 3, 40000, "Gorra2.jpeg", 8, 32000),
    productoApi(5, "Gorra Clásica Audi F1", 3, 35000, "Gorra3.jpeg", 20),
    productoApi(6, "Llavero Metálico F1", 4, 15000, "Llavero_1.jpeg", 50),
    productoApi(7, "Polera Tipo 1 - A", 5, 45000, "Polera_Tipo1_1.jpeg", 12),
    productoApi(8, "Polera Tipo 1 - B", 5, 45000, "Polera_Tipo1_2.jpeg", 12, 36000),
    productoApi(9, "Polera Tipo 1 - C", 5, 45000, "Polera_Tipo1_3.jpeg", 5),
    productoApi(10, "Polera Tipo 2 - A", 5, 50000, "Polera_Tipo2_1.jpeg", 10),
    productoApi(11, "Polera Tipo 2 - B", 5, 50000, "Polera_Tipo2_2.jpeg", 10, 40000),
    productoApi(12, "Polera Tipo 2 - C", 5, 50000, "Polera_Tipo2_3.jpeg", 7),
  ];
}

/* Rutas de /productos, /categorias y /boletas sobre arreglos en memoria que la prueba puede
   leer y modificar (state.productos, state.categorias y state.boletas). Valida lo mismo que el
   backend en lo básico: 404 si no existe, 409 al eliminar un producto "vendido"
   (state.vendidos), 409 por nombre de categoría repetido o con productos al eliminar. */
export function catalogoSimulado() {
  const state = {
    productos: productosIniciales(), categorias: CATEGORIAS_API.map((c) => ({ ...c })), vendidos: new Set(),
    // Boletas que ve el dashboard del administrador (GET /boletas); la prueba las llena si las necesita.
    boletas: [],
  };
  const buscar = (id) => state.productos.find((p) => p.id === Number(id));
  const buscarCategoria = (id) => state.categorias.find((c) => c.id === Number(id));
  const nombreRepetido = (nombre, idPropio) =>
    state.categorias.some((c) => c.id !== idPropio && c.nombre.toLowerCase() === nombre.toLowerCase());
  const completar = (d, id) => {
    const categoria = state.categorias.find((c) => c.id === d.categoriaId);
    return {
      ...d, id, categoria: categoria.nombre, oferta: d.precioOferta !== null,
      precioVigente: d.precioOferta ?? d.precio,
    };
  };
  state.rutas = {
    "GET /productos": () => respuestaJson(200, state.productos),
    "GET /productos/:id": ({ params }) =>
      buscar(params.id) ? respuestaJson(200, buscar(params.id)) : errorApi(404, `El producto ${params.id} no existe`),
    "GET /boletas": () => respuestaJson(200, state.boletas),
    "GET /categorias": () => respuestaJson(200, state.categorias),
    "POST /categorias": ({ cuerpo }) => {
      if (nombreRepetido(cuerpo.nombre)) return errorApi(409, `Ya existe la categoría ${cuerpo.nombre}`);
      const nueva = { id: Math.max(...state.categorias.map((c) => c.id)) + 1, nombre: cuerpo.nombre };
      state.categorias.push(nueva);
      return respuestaJson(201, nueva);
    },
    "PUT /categorias/:id": ({ cuerpo, params }) => {
      const categoria = buscarCategoria(params.id);
      if (!categoria) return errorApi(404, `La categoría ${params.id} no existe`);
      if (nombreRepetido(cuerpo.nombre, categoria.id)) return errorApi(409, `Ya existe la categoría ${cuerpo.nombre}`);
      categoria.nombre = cuerpo.nombre;
      return respuestaJson(200, categoria);
    },
    "DELETE /categorias/:id": ({ params }) => {
      const categoria = buscarCategoria(params.id);
      if (!categoria) return errorApi(404, `La categoría ${params.id} no existe`);
      if (state.productos.some((p) => p.categoriaId === categoria.id)) {
        return errorApi(409, `La categoría ${categoria.nombre} todavía tiene productos`);
      }
      state.categorias = state.categorias.filter((c) => c.id !== categoria.id);
      return new Response(null, { status: 204 });
    },
    "POST /productos": ({ cuerpo }) => {
      const nuevo = completar(cuerpo, Math.max(...state.productos.map((p) => p.id)) + 1);
      state.productos.push(nuevo);
      return respuestaJson(201, nuevo);
    },
    "PUT /productos/:id": ({ cuerpo, params }) => {
      if (!buscar(params.id)) return errorApi(404, `El producto ${params.id} no existe`);
      const indice = state.productos.indexOf(buscar(params.id));
      state.productos[indice] = completar(cuerpo, Number(params.id));
      return respuestaJson(200, state.productos[indice]);
    },
    "DELETE /productos/:id": ({ params }) => {
      if (!buscar(params.id)) return errorApi(404, `El producto ${params.id} no existe`);
      if (state.vendidos.has(Number(params.id))) {
        return errorApi(409, `El producto ${params.id} ya fue vendido y no se puede eliminar`);
      }
      state.productos = state.productos.filter((p) => p.id !== Number(params.id));
      return new Response(null, { status: 204 });
    },
  };
  return state;
}

/* Instala el catálogo simulado y devuelve su estado. */
export function simularCatalogo() {
  const state = catalogoSimulado();
  simularBackend(state.rutas);
  return state;
}

/* Rutas de /usuarios sobre un arreglo en memoria: las tres cuentas iniciales del
   backend. Repite sus reglas de conflicto (correo repetido, cuenta propia). */
export function usuariosSimulados() {
  const state = {
    usuarios: [
      { ...USUARIOS.admin, creadoEn: "2026-11-24T19:43:35" },
      { ...USUARIOS.vendedor, creadoEn: "2026-11-24T19:43:35" },
      { ...USUARIOS.cliente, creadoEn: "2026-11-24T19:43:35" },
    ],
  };
  const buscar = (id) => state.usuarios.find((u) => u.id === Number(id));
  state.rutas = {
    "GET /usuarios": () => respuestaJson(200, state.usuarios),
    "POST /usuarios": ({ cuerpo }) => {
      if (state.usuarios.some((u) => u.correo === cuerpo.correo)) {
        return errorApi(409, `El correo ${cuerpo.correo} ya está registrado`);
      }
      const nuevo = {
        id: Math.max(...state.usuarios.map((u) => u.id)) + 1, nombre: cuerpo.nombre,
        correo: cuerpo.correo, rol: cuerpo.rol, creadoEn: "2026-11-25T10:00:00",
      };
      state.usuarios.push(nuevo);
      return respuestaJson(201, nuevo);
    },
    "PUT /usuarios/:id": ({ cuerpo, params }) => {
      if (Number(params.id) === 1 && cuerpo.rol !== "ROLE_ADMIN") {
        return errorApi(409, "No puedes cambiar tu propio rol");
      }
      const indice = state.usuarios.indexOf(buscar(params.id));
      state.usuarios[indice] = { ...state.usuarios[indice], nombre: cuerpo.nombre, correo: cuerpo.correo, rol: cuerpo.rol };
      return respuestaJson(200, state.usuarios[indice]);
    },
    "DELETE /usuarios/:id": ({ params }) => {
      if (Number(params.id) === 1) return errorApi(409, "No puedes eliminar tu propia cuenta");
      state.usuarios = state.usuarios.filter((u) => u.id !== Number(params.id));
      return new Response(null, { status: 204 });
    },
  };
  return state;
}

export function simularUsuarios() {
  const state = usuariosSimulados();
  simularBackend(state.rutas);
  return state;
}

/* Espera hasta que la condición se cumpla. No sirve waitFor(() => expect(...)): los
   expect de Jasmine no lanzan al fallar, así que waitFor terminaría en el primer intento. */
export function esperar(condicion) {
  return waitFor(() => {
    if (!condicion()) throw new Error("La condición todavía no se cumple");
  });
}
