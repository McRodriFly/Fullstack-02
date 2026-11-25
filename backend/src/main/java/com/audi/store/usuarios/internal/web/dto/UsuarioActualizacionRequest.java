package com.audi.store.usuarios.internal.web.dto;

import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.service.DatosUsuario;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Cambios a un usuario desde la administración.
 *
 * @param contrasena omitir o enviar {@code null} para conservar la actual
 */
@Schema(description = "Cambios a un usuario desde la administración. Un PUT reemplaza nombre, correo y rol.")
public record UsuarioActualizacionRequest(
        @NotBlank @Size(max = 100)
        @Schema(description = "Nombre de la persona. Máximo 100 caracteres.", example = "Vera Soto")
        String nombre,
        @NotBlank @Email @Size(max = 150)
        @Schema(description = "Correo electrónico; no puede usarlo otro usuario.", example = "vendedor@duoc.cl")
        String correo,
        @Size(min = 4, max = 72)
        @Schema(description = "Contraseña nueva, entre 4 y 72 caracteres. Omitir para conservar la actual.",
                example = "5678", nullable = true)
        String contrasena,
        @NotNull
        @Schema(description = "Rol del usuario. El administrador no puede cambiar su propio rol.", example = "ROLE_VENDEDOR")
        Rol rol) {

    public DatosUsuario aDatos() {
        return new DatosUsuario(nombre, correo, contrasena, rol);
    }
}
