package com.audi.store.usuarios.internal.web.dto;

import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.domain.Usuario;
import java.time.LocalDateTime;

/** Datos públicos de un usuario. Nunca incluye la contraseña ni su hash. */
public record UsuarioResponse(Long id, String nombre, String correo, Rol rol, LocalDateTime creadoEn) {

    public static UsuarioResponse desde(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getCorreo(), u.getRol(), u.getCreadoEn());
    }
}
