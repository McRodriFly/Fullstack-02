/* AuthContext: estado de la sesión, persistencia ante recargas y cierre de sesión. */
import { act, cleanup, renderHook } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { borrarSesion, guardarSesion } from "../services/sesion";
import { rutaInicialPara } from "../utils/roles";
import {
  CLAVE_SESION, USUARIOS, errorApi, guardarSesionDePrueba, respuestaJson, respuestaSesion, simularBackend,
} from "./helpers";

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider });
}

describe("AuthContext", () => {
  beforeEach(() => localStorage.removeItem(CLAVE_SESION));
  afterEach(cleanup);

  it("sin sesión guardada no hay usuario", () => {
    const { result } = renderAuth();

    expect(result.current.usuario).toBe(null);
    expect(result.current.estaAutenticado).toBe(false);
  });

  it("recupera la sesión guardada al recargar la página", () => {
    guardarSesionDePrueba(USUARIOS.vendedor);

    const { result } = renderAuth();

    expect(result.current.usuario).toEqual(USUARIOS.vendedor);
    expect(result.current.estaAutenticado).toBe(true);
  });

  it("iniciarSesion deja al usuario autenticado y lo devuelve", async () => {
    simularBackend({ "POST /auth/login": () => respuestaJson(200, respuestaSesion(USUARIOS.admin)) });
    const { result } = renderAuth();

    let devuelto;
    await act(async () => {
      devuelto = await result.current.iniciarSesion("admin@duoc.cl", "1234");
    });

    expect(devuelto).toEqual(USUARIOS.admin);
    expect(result.current.usuario).toEqual(USUARIOS.admin);
  });

  it("si el login falla, propaga el error y sigue sin usuario", async () => {
    simularBackend({ "POST /auth/login": () => errorApi(401, "Correo o contraseña incorrectos") });
    const { result } = renderAuth();

    let error;
    await act(async () => {
      await result.current.iniciarSesion("admin@duoc.cl", "mala").catch((e) => { error = e; });
    });

    expect(error.message).toBe("Correo o contraseña incorrectos");
    expect(result.current.usuario).toBe(null);
  });

  it("registrarse deja la sesión iniciada como cliente", async () => {
    simularBackend({ "POST /auth/registro": () => respuestaJson(201, respuestaSesion(USUARIOS.cliente)) });
    const { result } = renderAuth();

    await act(async () => {
      await result.current.registrarse({ nombre: "Cliente", correo: "cliente@gmail.com", contrasena: "1234" });
    });

    expect(result.current.usuario.rol).toBe("ROLE_CLIENTE");
  });

  it("cerrarSesion olvida al usuario y borra los tokens guardados", () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    const { result } = renderAuth();

    act(() => result.current.cerrarSesion());

    expect(result.current.usuario).toBe(null);
    expect(localStorage.getItem(CLAVE_SESION)).toBe(null);
  });

  it("se entera de los cambios hechos fuera de React (refresco o sesión vencida)", () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    const { result } = renderAuth();

    // El cliente HTTP guarda la sesión renovada con el rol actual…
    act(() => guardarSesion(respuestaSesion({ ...USUARIOS.cliente, rol: "ROLE_VENDEDOR" })));
    expect(result.current.usuario.rol).toBe("ROLE_VENDEDOR");

    // …o la borra cuando el backend ya no acepta el refresco.
    act(() => borrarSesion());
    expect(result.current.estaAutenticado).toBe(false);
  });
});

describe("rutaInicialPara", () => {
  it("el administrador va al resumen, el vendedor a los productos y el cliente a la tienda", () => {
    expect(rutaInicialPara(USUARIOS.admin)).toBe("/admin");
    expect(rutaInicialPara(USUARIOS.vendedor)).toBe("/admin/productos");
    expect(rutaInicialPara(USUARIOS.cliente)).toBe("/");
  });
});
