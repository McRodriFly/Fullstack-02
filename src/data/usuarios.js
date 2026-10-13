/* Usuarios simulados del admin (misma idea que productos.js pero simple):
   listado en memoria + localStorage, con listar y eliminar. */

const STORAGE_KEY = "audi_f1_usuarios";

const usuariosIniciales = [
  { id: 1, nombre: "Administrador Jefe", correo: "admin@duoc.cl", rol: "admin" },
  { id: 2, nombre: "Cliente Fanático", correo: "fan@gmail.com", rol: "cliente" },
  { id: 3, nombre: "Piloto Reserva", correo: "piloto@duoc.cl", rol: "cliente" },
];

function cargar() {
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (guardados) return JSON.parse(guardados);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosIniciales));
  return [...usuariosIniciales];
}

function guardar(usuarios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
}

export function obtenerUsuarios() {
  return cargar();
}

export function eliminarUsuario(id) {
  guardar(cargar().filter((u) => u.id !== Number(id)));
}

export function crearUsuario(nuevo) {
  const usuarios = cargar();
  const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
  const usuario = { ...nuevo, id: nuevoId };
  usuarios.push(usuario);
  guardar(usuarios);
  return usuario;
}
