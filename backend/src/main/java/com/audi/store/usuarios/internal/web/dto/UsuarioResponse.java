package com.audi.store.usuarios.internal.web.dto;

import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.domain.Usuario;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/** Datos públicos de un usuario. Nunca incluye la contraseña ni su hash. */
@Schema(description = "Datos públicos de un usuario. Nunca incluye la contraseña ni su hash.")
public record UsuarioResponse(
        @Schema(description = "Identificador del usuario.", example = "3") Long id,
        @Schema(description = "Nombre de la persona.", example = "Cliente Demo") String nombre,
        @Schema(description = "Correo electrónico.", example = "cliente@gmail.com") String correo,
        @Schema(description = "Rol de la cuenta.", example = "ROLE_CLIENTE") Rol rol,
        @Schema(description = "Fecha y hora en que se creó la cuenta.", example = "2026-11-25T12:55:03") LocalDateTime creadoEn) {

    public static UsuarioResponse desde(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getCorreo(), u.getRol(), u.getCreadoEn());
    }
}
