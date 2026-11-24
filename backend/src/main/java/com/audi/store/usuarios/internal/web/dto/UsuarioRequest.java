package com.audi.store.usuarios.internal.web.dto;

import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.service.DatosUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Alta de un usuario desde la administración.
 *
 * @param contrasena en claro, entre 4 y 72 caracteres (BCrypt ignora lo que pase de 72 bytes)
 */
public record UsuarioRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Email @Size(max = 150) String correo,
        @NotBlank @Size(min = 4, max = 72) String contrasena,
        @NotNull Rol rol) {

    public DatosUsuario aDatos() {
        return new DatosUsuario(nombre, correo, contrasena, rol);
    }
}
