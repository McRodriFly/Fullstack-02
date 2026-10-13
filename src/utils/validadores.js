/* =========================================================
   VALIDADORES (funciones puras)
   Migrados de js/validaciones.js y js/registro.js de la EP1.
   Al ser funciones puras (sin DOM) son fáciles de probar
   con pruebas unitarias en Jasmine/Karma.
========================================================= */

const DOMINIOS_VALIDOS = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];

// Correo permitido solo si termina en un dominio válido (regla de la EP1)
export function correoEsValido(correo) {
  const limpio = correo.trim();
  if (!limpio || limpio.length > 100) return false;
  return DOMINIOS_VALIDOS.some((dominio) => limpio.endsWith(dominio));
}

// Valida RUT chileno sin puntos ni guión (módulo 11)
export function rutEsValido(rut) {
  const limpio = rut.trim().toUpperCase();
  if (!/^[0-9]+[0-9K]$/.test(limpio) || limpio.length < 7 || limpio.length > 9) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i), 10) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? "0" : resto === 10 ? "K" : resto.toString();

  return dvEsperado === dvIngresado;
}

// Contraseña entre 4 y 10 caracteres (regla de la EP1)
export function passwordEsValida(pass) {
  return pass.length >= 4 && pass.length <= 10;
}

// ================== LOGIN ==================
// Devuelve "" si todo OK, o el mensaje de error correspondiente.
export function validarLogin({ correo, password }) {
  const correoLimpio = correo.trim();
  if (!correoLimpio) return "El correo es obligatorio.";
  if (correoLimpio.length > 100) return "El correo no puede exceder los 100 caracteres.";
  if (!correoEsValido(correoLimpio))
    return "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com.";
  if (!password.trim()) return "La contraseña es obligatoria.";
  if (!passwordEsValida(password.trim()))
    return "La contraseña debe tener entre 4 y 10 caracteres.";
  return "";
}

// ================== REGISTRO ==================
export function validarRegistro({ rut, correo, nombre, apellidos, password, passwordConf }) {
  if (!rut.trim() || !rutEsValido(rut))
    return "RUT inválido. Ej: 11111111-1 (sin puntos ni guión: 111111111).";
  if (!correoEsValido(correo))
    return "Correo obligatorio, máx. 100 caracteres y dominio @duoc.cl, @profesor.duoc.cl o @gmail.com.";
  if (!nombre.trim() || nombre.trim().length > 50)
    return "El nombre es obligatorio (Máx. 50 caracteres).";
  if (!apellidos.trim() || apellidos.trim().length > 100)
    return "Los apellidos son obligatorios (Máx. 100 caracteres).";
  if (!passwordEsValida(password.trim()))
    return "La contraseña debe tener entre 4 y 10 caracteres.";
  if (password !== passwordConf)
    return "Las contraseñas no coinciden. Inténtalo nuevamente.";
  return "";
}

// ================== CONTACTO ==================
export function validarContacto({ nombre, correo, comentario }) {
  if (!nombre.trim() || nombre.trim().length > 100)
    return "El nombre es obligatorio (Máx. 100 caracteres).";
  if (!correoEsValido(correo))
    return "Correo obligatorio, máx. 100 caracteres y dominio @duoc.cl, @profesor.duoc.cl o @gmail.com.";
  if (!comentario.trim() || comentario.trim().length > 500)
    return "El comentario es obligatorio (Máx. 500 caracteres).";
  return "";
}
