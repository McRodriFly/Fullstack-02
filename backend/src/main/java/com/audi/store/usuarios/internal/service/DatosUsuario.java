package com.audi.store.usuarios.internal.service;

import com.audi.store.usuarios.internal.domain.Rol;

/**
 * Datos para crear o actualizar un usuario desde la administración.
 *
 * @param contrasena en claro; al actualizar, {@code null} o vacía conserva la actual
 */
public record DatosUsuario(String nombre, String correo, String contrasena, Rol rol) {
}
