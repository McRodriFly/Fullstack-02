package com.audi.store.usuarios.internal.web.dto;

import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.service.DatosUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Cambios a un usuario desde la administración.
 *
 * @param contrasena omitir o enviar {@code null} para conservar la actual
 */
public record UsuarioActualizacionRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Email @Size(max = 150) String correo,
        @Size(min = 4, max = 72) String contrasena,
        @NotNull Rol rol) {

    public DatosUsuario aDatos() {
        return new DatosUsuario(nombre, correo, contrasena, rol);
    }
}
