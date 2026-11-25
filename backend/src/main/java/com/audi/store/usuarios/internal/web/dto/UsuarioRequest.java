package com.audi.store.usuarios.internal.web.dto;

import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.service.DatosUsuario;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Alta de un usuario desde la administración.
 *
 * @param contrasena en claro, entre 4 y 72 caracteres (BCrypt ignora lo que pase de 72 bytes)
 */
@Schema(description = "Alta de un usuario desde la administración, con el rol que elija el administrador.")
public record UsuarioRequest(
        @NotBlank @Size(max = 100)
        @Schema(description = "Nombre de la persona. Máximo 100 caracteres.", example = "Vera Soto")
        String nombre,
        @NotBlank @Email @Size(max = 150)
        @Schema(description = "Correo electrónico; no puede estar registrado.", example = "vera@duoc.cl")
        String correo,
        @NotBlank @Size(min = 4, max = 72)
        @Schema(description = "Contraseña en claro, entre 4 y 72 caracteres.", example = "1234")
        String contrasena,
        @NotNull
        @Schema(description = "Rol de la cuenta.", example = "ROLE_VENDEDOR")
        Rol rol) {

    public DatosUsuario aDatos() {
        return new DatosUsuario(nombre, correo, contrasena, rol);
    }
}
