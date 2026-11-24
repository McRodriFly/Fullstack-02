package com.audi.store.usuarios.api;

/**
 * Datos de un usuario que pueden compartirse con otros módulos (nunca incluye la contraseña).
 *
 * @param rol uno de ROLE_ADMIN, ROLE_VENDEDOR o ROLE_CLIENTE
 */
public record UsuarioResumen(Long id, String correo, String nombre, String rol) {
}
