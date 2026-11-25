/* Almacenamiento de la sesión: vencimiento de tokens, lectura robusta y avisos. */
import { borrarSesion, guardarSesion, leerSesion, suscribirSesion, tokenVencido } from "../services/sesion";
import { CLAVE_SESION, USUARIOS, guardarSesionDePrueba, respuestaSesion, tokenDePrueba } from "./helpers";

describe("tokenVencido", () => {
  it("un token con exp en el futuro sigue vigente y uno en el pasado venció", () => {
    expect(tokenVencido(tokenDePrueba(60))).toBe(false);
    expect(tokenVencido(tokenDePrueba(-1))).toBe(true);
  });

  it("compara contra el instante indicado", () => {
    const token = tokenDePrueba(60);
    expect(tokenVencido(token, Date.now() + 61_000)).toBe(true);
  });

  it("lee contenidos codificados en Base64 URL (con - y _)", () => {
    // "extra" fuerza caracteres que en Base64 URL se escriben como - o _.
    const token = tokenDePrueba(60, "??>>??>>");
    expect(token.split(".")[1]).toMatch(/[-_]/);
    expect(tokenVencido(token)).toBe(false);
  });

  it("un token mal formado o sin exp se trata como vencido", () => {
    expect(tokenVencido("no-es-un-jwt")).toBe(true);
    expect(tokenVencido(undefined)).toBe(true);
    expect(tokenVencido(`a.${btoa(JSON.stringify({ sub: "1" }))}.b`)).toBe(true);
  });
});

describe("leerSesion", () => {
  beforeEach(() => localStorage.removeItem(CLAVE_SESION));

  it("sin sesión guardada devuelve null", () => {
    expect(leerSesion()).toBe(null);
  });

  it("recupera la sesión guardada (sobrevive a una recarga)", () => {
    guardarSesionDePrueba(USUARIOS.cliente);
    expect(leerSesion().usuario).toEqual(USUARIOS.cliente);
  });

  it("conserva la sesión aunque el token de acceso haya vencido: se puede refrescar", () => {
    guardarSesionDePrueba(USUARIOS.cliente, { acceso: tokenDePrueba(-10) });
    expect(leerSesion()).not.toBe(null);
  });

  it("descarta la sesión si el token de refresco venció", () => {
    guardarSesionDePrueba(USUARIOS.cliente, { refresco: tokenDePrueba(-10) });
    expect(leerSesion()).toBe(null);
    expect(localStorage.getItem(CLAVE_SESION)).toBe(null);
  });

  it("descarta un valor corrupto o incompleto", () => {
    localStorage.setItem(CLAVE_SESION, "{no es json");
    expect(leerSesion()).toBe(null);
    expect(localStorage.getItem(CLAVE_SESION)).toBe(null);

    localStorage.setItem(CLAVE_SESION, JSON.stringify({ tokenAcceso: "a", tokenRefresco: "r" }));
    expect(leerSesion()).toBe(null);
    expect(localStorage.getItem(CLAVE_SESION)).toBe(null);
  });
});

describe("guardarSesion, borrarSesion y suscribirSesion", () => {
  beforeEach(() => localStorage.removeItem(CLAVE_SESION));

  it("guarda solo los tokens y el usuario, y avisa a los suscritos", () => {
    const aviso = jasmine.createSpy("aviso");
    const cancelar = suscribirSesion(aviso);

    guardarSesion(respuestaSesion(USUARIOS.admin));

    const guardada = JSON.parse(localStorage.getItem(CLAVE_SESION));
    expect(Object.keys(guardada).sort()).toEqual(["tokenAcceso", "tokenRefresco", "usuario"]);
    expect(aviso).toHaveBeenCalledWith(jasmine.objectContaining({ usuario: USUARIOS.admin }));
    cancelar();
  });

  it("borrar la sesión limpia el almacenamiento y avisa con null", () => {
    guardarSesionDePrueba(USUARIOS.admin);
    const aviso = jasmine.createSpy("aviso");
    const cancelar = suscribirSesion(aviso);

    borrarSesion();

    expect(localStorage.getItem(CLAVE_SESION)).toBe(null);
    expect(aviso).toHaveBeenCalledWith(null);
    cancelar();
  });

  it("tras cancelar la suscripción ya no llegan avisos", () => {
    const aviso = jasmine.createSpy("aviso");
    suscribirSesion(aviso)();

    borrarSesion();

    expect(aviso).not.toHaveBeenCalled();
  });
});
