/* Validadores puros: correo, RUT, contraseña y formularios (login, registro, contacto, checkout). */
import {
  rutEsValido,
  correoEsValido,
  passwordEsValida,
  validarLogin,
  validarRegistro,
  validarContacto,
  validarCheckout,
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
    expect(rutEsValido("111111111")).toBe(true);
  });

  it("acepta RUT con dígito verificador K (mayúscula o minúscula)", () => {
    expect(rutEsValido("10000013K")).toBe(true);
    expect(rutEsValido("10000013k")).toBe(true);
  });

  it("acepta RUT con dígito verificador 0", () => {
    expect(rutEsValido("100000040")).toBe(true);
  });

  it("rechaza un RUT con dígito verificador incorrecto", () => {
    expect(rutEsValido("111111112")).toBe(false);
    expect(rutEsValido("123")).toBe(false);
    expect(rutEsValido("abc")).toBe(false);
  });
});

describe("Validador de contraseña", () => {
  it("acepta entre 4 y 10 caracteres (valores límite)", () => {
    expect(passwordEsValida("1234")).toBe(true);
    expect(passwordEsValida("1234567890")).toBe(true);
  });

  it("rechaza menos de 4 o más de 10 caracteres", () => {
    expect(passwordEsValida("123")).toBe(false);
    expect(passwordEsValida("12345678901")).toBe(false);
  });
});

describe("Validador de login", () => {
  it("devuelve mensaje de error cuando el correo está vacío", () => {
    const error = validarLogin({ correo: "", password: "1234" });
    expect(error).toContain("correo");
  });

  it("valida el largo del correo, el dominio y la contraseña en orden", () => {
    expect(validarLogin({ correo: "a".repeat(95) + "@duoc.cl", password: "1234" }))
      .toContain("100 caracteres");
    expect(validarLogin({ correo: "x@yahoo.com", password: "1234" })).toContain("Solo se permiten");
    expect(validarLogin({ correo: "x@duoc.cl", password: "   " })).toContain("obligatoria");
    expect(validarLogin({ correo: "x@duoc.cl", password: "12" })).toContain("entre 4 y 10");
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

  it("detecta cada campo inválido con su mensaje", () => {
    expect(validarRegistro({ ...datosValidos, rut: "" })).toContain("RUT inválido");
    expect(validarRegistro({ ...datosValidos, correo: "a@hotmail.com" })).toContain("Correo");
    expect(validarRegistro({ ...datosValidos, nombre: " " })).toContain("nombre");
    expect(validarRegistro({ ...datosValidos, apellidos: "" })).toContain("apellidos");
    expect(validarRegistro({ ...datosValidos, password: "12", passwordConf: "12" }))
      .toContain("entre 4 y 10");
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

  it("rechaza nombre vacío o correo de otro dominio, y acepta datos válidos", () => {
    const base = { nombre: "Ana", correo: "ana@duoc.cl", comentario: "Hola" };
    expect(validarContacto({ ...base, nombre: "" })).toContain("nombre");
    expect(validarContacto({ ...base, correo: "ana@outlook.com" })).toContain("Correo");
    expect(validarContacto({ ...base, comentario: "x".repeat(501) })).toContain("500");
    expect(validarContacto(base)).toBe("");
  });
});

describe("Validador de checkout", () => {
  const datosValidos = {
    nombre: "Carlos Sainz",
    correo: "carlos@gmail.com",
    direccion: "Av. Siempre Viva 123",
    ciudad: "Santiago",
    tarjeta: "4242 4242 4242 4242", // con espacios: también es válida
    vencimiento: "12/28",
    cvv: "123",
  };

  it("devuelve un objeto vacío cuando todo es válido", () => {
    expect(validarCheckout(datosValidos)).toEqual({});
  });

  it("devuelve un error por cada campo inválido", () => {
    const errores = validarCheckout({
      nombre: "Al",
      correo: "sin-arroba",
      direccion: "",
      ciudad: " ",
      tarjeta: "1234",
      vencimiento: "13/28",
      cvv: "12",
    });
    expect(Object.keys(errores).sort()).toEqual(
      ["ciudad", "correo", "cvv", "direccion", "nombre", "tarjeta", "vencimiento"]
    );
  });

  it("valida el formato MM/AA del vencimiento (valores límite)", () => {
    expect(validarCheckout({ ...datosValidos, vencimiento: "01/30" }).vencimiento).toBeUndefined();
    expect(validarCheckout({ ...datosValidos, vencimiento: "00/30" }).vencimiento).toBeDefined();
    expect(validarCheckout({ ...datosValidos, vencimiento: "1/30" }).vencimiento).toBeDefined();
  });
});
