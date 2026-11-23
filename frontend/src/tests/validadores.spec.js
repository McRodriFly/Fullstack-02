/* =========================================================
   PRUEBAS DE VALIDADORES (lógica pura)
   Abarca: correo con dominios válidos, RUT módulo 11,
   contraseña y los validadores completos de login/registro/contacto.
========================================================= */
import {
  rutEsValido,
  correoEsValido,
  passwordEsValida,
  validarLogin,
  validarRegistro,
  validarContacto,
} from "../utils/validadores";

describe("Validador de correo", () => {
  it("acepta correos con dominios permitidos", () => {
    expect(correoEsValido("alumno@duoc.cl")).toBe(true);
    expect(correoEsValido("profe@profesor.duoc.cl")).toBe(true);
    expect(correoEsValido("fan@gmail.com")).toBe(true);
  });

  it("rechaza correos con dominios no permitidos o vacíos", () => {
    expect(correoEsValido("usuario@hotmail.com")).toBe(false);
    expect(correoEsValido("")).toBe(false);
    expect(correoEsValido("sin-arroba.com")).toBe(false);
  });
});

describe("Validador de RUT chileno (módulo 11)", () => {
  it("acepta un RUT con dígito verificador correcto", () => {
    // 111111111: el dígito verificador 1 es correcto para el cuerpo 11111111
    expect(rutEsValido("111111111")).toBe(true);
  });

  it("rechaza un RUT con dígito verificador incorrecto", () => {
    expect(rutEsValido("111111112")).toBe(false);
    expect(rutEsValido("123")).toBe(false);
    expect(rutEsValido("abc")).toBe(false);
  });
});

describe("Validador de login", () => {
  it("devuelve mensaje de error cuando el correo está vacío", () => {
    const error = validarLogin({ correo: "", password: "1234" });
    expect(error).toContain("correo");
  });

  it("devuelve cadena vacía cuando correo y contraseña son válidos", () => {
    const error = validarLogin({ correo: "alumno@duoc.cl", password: "1234" });
    expect(error).toBe("");
  });
});

describe("Validador de registro", () => {
  const datosValidos = {
    rut: "111111111",
    correo: "nuevo@gmail.com",
    nombre: "Carlos",
    apellidos: "Sanz",
    password: "1234",
    passwordConf: "1234",
  };

  it("acepta un registro completo y válido", () => {
    expect(validarRegistro(datosValidos)).toBe("");
  });

  it("rechaza cuando las contraseñas no coinciden", () => {
    expect(validarRegistro({ ...datosValidos, passwordConf: "9999" }))
      .toContain("no coinciden");
  });
});

describe("Validador de contacto", () => {
  it("rechaza un comentario vacío", () => {
    const error = validarContacto({ nombre: "Ana", correo: "ana@duoc.cl", comentario: "" });
    expect(error).toContain("comentario");
  });
});
