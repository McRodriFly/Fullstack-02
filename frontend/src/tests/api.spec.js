/* Cliente HTTP: encabezados, errores del backend y renovación automática del token. */
import { API_URL, ErrorApi, api, iniciarSesionApi, registrarApi } from "../services/api";
import { borrarSesion, leerSesion } from "../services/sesion";
import {
  CLAVE_SESION, USUARIOS, errorApi, guardarSesionDePrueba, respuestaJson, respuestaSesion,
  simularBackend, tokenDePrueba,
} from "./helpers";

// Espera que la promesa falle y devuelve el error para revisarlo.
async function fallo(promesa) {
  try {
    await promesa;
  } catch (e) {
    return e;
  }
  throw new Error("Se esperaba un error");
}

describe("Cliente HTTP (services/api.js)", () => {
  beforeEach(() => localStorage.removeItem(CLAVE_SESION));

  describe("solicitudes", () => {
    it("apunta por defecto al backend local", () => {
      expect(API_URL).toBe("http://localhost:8080/api/v1");
    });

    it("sin sesión no envía Authorization ni Content-Type en un GET", async () => {
      const fetch = simularBackend({ "GET /productos": () => respuestaJson(200, [{ id: 1 }]) });

      expect(await api.get("/productos")).toEqual([{ id: 1 }]);
      const { headers } = fetch.calls.mostRecent().args[1];
      expect(headers.Authorization).toBeUndefined();
      expect(headers["Content-Type"]).toBeUndefined();
    });

    it("con sesión envía el token de acceso como Bearer", async () => {
      const acceso = tokenDePrueba(900, "mi-token");
      guardarSesionDePrueba(USUARIOS.cliente, { acceso });
      let recibido;
      simularBackend({ "GET /boletas/mias": ({ token }) => { recibido = token; return respuestaJson(200, []); } });

      await api.get("/boletas/mias");

      expect(recibido).toBe(acceso);
    });

    it("POST y PUT envían el cuerpo como JSON", async () => {
      const recibidos = [];
      const fetch = simularBackend({
        "POST /categorias": ({ cuerpo }) => { recibidos.push(cuerpo); return respuestaJson(201, { id: 6 }); },
        "PUT /categorias/6": ({ cuerpo }) => { recibidos.push(cuerpo); return respuestaJson(200, { id: 6 }); },
      });

      await api.post("/categorias", { nombre: "Llaveros" });
      await api.put("/categorias/6", { nombre: "Llaveros F1" });

      expect(recibidos).toEqual([{ nombre: "Llaveros" }, { nombre: "Llaveros F1" }]);
      expect(fetch.calls.mostRecent().args[1].headers["Content-Type"]).toBe("application/json");
    });

    it("una respuesta 204 devuelve null", async () => {
      simularBackend({ "DELETE /productos/4": () => new Response(null, { status: 204 }) });

      expect(await api.eliminar("/productos/4")).toBe(null);
    });
  });

  describe("errores", () => {
    it("entrega el mensaje, el estado y los detalles que envía el backend", async () => {
      simularBackend({
        "POST /productos": () => errorApi(400, "Hay datos inválidos en la solicitud", ["precio: debe ser mayor o igual a 0"]),
      });

      const error = await fallo(api.post("/productos", { precio: -1 }));

      expect(error instanceof ErrorApi).toBe(true);
      expect(error.estado).toBe(400);
      expect(error.message).toBe("Hay datos inválidos en la solicitud");
      expect(error.detalles).toEqual(["precio: debe ser mayor o igual a 0"]);
    });

    it("un error sin cuerpo JSON o sin mensaje usa un texto genérico", async () => {
      simularBackend({
        "GET /productos": () => new Response("Bad Gateway", { status: 502 }),
        "GET /categorias": () => respuestaJson(500, {}),
      });

      const sinJson = await fallo(api.get("/productos"));
      const sinMensaje = await fallo(api.get("/categorias"));

      expect(sinJson.message).toBe("Error 502 al comunicarse con el servidor.");
      expect(sinJson.detalles).toEqual([]);
      expect(sinMensaje.message).toBe("Error 500 al comunicarse con el servidor.");
    });

    it("si el servidor no responde, avisa que no hay conexión (estado 0)", async () => {
      spyOn(window, "fetch").and.rejectWith(new TypeError("Failed to fetch"));

      const error = await fallo(api.get("/productos"));

      expect(error.estado).toBe(0);
      expect(error.message).toMatch(/No se pudo conectar/);
    });

    it("un 401 sin sesión no intenta refrescar", async () => {
      const fetch = simularBackend({ "GET /boletas/mias": () => errorApi(401, "Debes iniciar sesión") });

      const error = await fallo(api.get("/boletas/mias"));

      expect(error.message).toBe("Debes iniciar sesión");
      expect(fetch.calls.count()).toBe(1);
    });
  });

  describe("renovación del token", () => {
    it("si el token de acceso ya venció, lo renueva antes de enviar la solicitud", async () => {
      guardarSesionDePrueba(USUARIOS.cliente, { acceso: tokenDePrueba(-5) });
      const nuevo = respuestaSesion(USUARIOS.cliente, { acceso: tokenDePrueba(900, "nuevo") });
      let recibido;
      const fetch = simularBackend({
        "POST /auth/refresh": () => respuestaJson(200, nuevo),
        "GET /boletas/mias": ({ token }) => { recibido = token; return respuestaJson(200, []); },
      });

      await api.get("/boletas/mias");

      expect(fetch.calls.count()).toBe(2);
      expect(recibido).toBe(nuevo.tokenAcceso);
      expect(leerSesion().tokenAcceso).toBe(nuevo.tokenAcceso);
    });

    it("ante un 401 renueva el token y repite la solicitud una vez", async () => {
      guardarSesionDePrueba(USUARIOS.cliente, { acceso: tokenDePrueba(900, "revocado") });
      const nuevo = respuestaSesion(USUARIOS.cliente, { acceso: tokenDePrueba(900, "nuevo") });
      simularBackend({
        "POST /auth/refresh": ({ cuerpo }) => {
          expect(cuerpo.tokenRefresco).toBeTruthy();
          return respuestaJson(200, nuevo);
        },
        "GET /boletas/mias": ({ token }) =>
          token === nuevo.tokenAcceso ? respuestaJson(200, [{ id: 10 }]) : errorApi(401, "Tu sesión expiró; vuelve a iniciar sesión"),
      });

      expect(await api.get("/boletas/mias")).toEqual([{ id: 10 }]);
    });

    it("el refresco trae el rol actual del usuario", async () => {
      guardarSesionDePrueba(USUARIOS.cliente, { acceso: tokenDePrueba(-5) });
      const ascendido = { ...USUARIOS.cliente, rol: "ROLE_VENDEDOR" };
      simularBackend({
        "POST /auth/refresh": () => respuestaJson(200, respuestaSesion(ascendido)),
        "GET /productos": () => respuestaJson(200, []),
      });

      await api.get("/productos");

      expect(leerSesion().usuario.rol).toBe("ROLE_VENDEDOR");
    });

    it("si el backend rechaza el refresco, cierra la sesión", async () => {
      guardarSesionDePrueba(USUARIOS.cliente, { acceso: tokenDePrueba(-5) });
      simularBackend({ "POST /auth/refresh": () => errorApi(401, "La cuenta ya no existe; inicia sesión de nuevo") });

      const error = await fallo(api.get("/boletas/mias"));

      expect(error.estado).toBe(401);
      expect(error.message).toBe("Tu sesión expiró; vuelve a iniciar sesión.");
      expect(leerSesion()).toBe(null);
    });

    it("si falla la red durante el refresco, conserva la sesión", async () => {
      guardarSesionDePrueba(USUARIOS.cliente, { acceso: tokenDePrueba(-5) });
      spyOn(window, "fetch").and.rejectWith(new TypeError("Failed to fetch"));

      const error = await fallo(api.get("/boletas/mias"));

      expect(error.estado).toBe(0);
      expect(leerSesion()).not.toBe(null);
    });

    it("si tras renovar el backend vuelve a responder 401, cierra la sesión", async () => {
      guardarSesionDePrueba(USUARIOS.cliente);
      simularBackend({
        "POST /auth/refresh": () => respuestaJson(200, respuestaSesion(USUARIOS.cliente)),
        "GET /boletas/mias": () => errorApi(401, "Debes iniciar sesión"),
      });

      const error = await fallo(api.get("/boletas/mias"));

      expect(error.estado).toBe(401);
      expect(leerSesion()).toBe(null);
    });

    it("si la sesión se cerró mientras la solicitud viajaba, no intenta refrescar", async () => {
      guardarSesionDePrueba(USUARIOS.cliente);
      const fetch = simularBackend({
        "GET /boletas/mias": () => {
          borrarSesion(); // por ejemplo, el usuario cerró sesión en otra parte de la app
          return errorApi(401, "Tu sesión expiró; vuelve a iniciar sesión");
        },
      });

      const error = await fallo(api.get("/boletas/mias"));

      expect(error.estado).toBe(401);
      expect(fetch.calls.allArgs().some(([url]) => url.endsWith("/auth/refresh"))).toBe(false);
    });

    it("varias solicitudes simultáneas comparten un solo refresco", async () => {
      guardarSesionDePrueba(USUARIOS.cliente, { acceso: tokenDePrueba(-5) });
      const fetch = simularBackend({
        "POST /auth/refresh": () => respuestaJson(200, respuestaSesion(USUARIOS.cliente)),
        "GET /productos": () => respuestaJson(200, []),
        "GET /categorias": () => respuestaJson(200, []),
        "GET /boletas/mias": () => respuestaJson(200, []),
      });

      await Promise.all([api.get("/productos"), api.get("/categorias"), api.get("/boletas/mias")]);

      const refrescos = fetch.calls.allArgs().filter(([url]) => url.endsWith("/auth/refresh"));
      expect(refrescos.length).toBe(1);
    });
  });

  describe("inicio de sesión y registro", () => {
    it("el login guarda la sesión que devuelve el backend", async () => {
      simularBackend({
        "POST /auth/login": ({ cuerpo }) => {
          expect(cuerpo).toEqual({ correo: "admin@duoc.cl", contrasena: "1234" });
          return respuestaJson(200, respuestaSesion(USUARIOS.admin));
        },
      });

      const sesion = await iniciarSesionApi("admin@duoc.cl", "1234");

      expect(sesion.usuario).toEqual(USUARIOS.admin);
      expect(leerSesion().usuario).toEqual(USUARIOS.admin);
    });

    it("con credenciales incorrectas no guarda nada", async () => {
      simularBackend({ "POST /auth/login": () => errorApi(401, "Correo o contraseña incorrectos") });

      const error = await fallo(iniciarSesionApi("admin@duoc.cl", "mala"));

      expect(error.message).toBe("Correo o contraseña incorrectos");
      expect(leerSesion()).toBe(null);
    });

    it("el registro envía nombre, correo y contraseña y deja la sesión iniciada", async () => {
      simularBackend({
        "POST /auth/registro": ({ cuerpo }) => {
          expect(cuerpo).toEqual({ nombre: "Ana Pérez", correo: "ana@gmail.com", contrasena: "abcd" });
          return respuestaJson(201, respuestaSesion({ ...USUARIOS.cliente, nombre: "Ana Pérez" }));
        },
      });

      await registrarApi({ nombre: "Ana Pérez", correo: "ana@gmail.com", contrasena: "abcd" });

      expect(leerSesion().usuario.nombre).toBe("Ana Pérez");
    });
  });
});
