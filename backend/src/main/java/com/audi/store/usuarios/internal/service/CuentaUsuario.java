package com.audi.store.usuarios.internal.service;

import com.audi.store.usuarios.internal.domain.Usuario;
import java.util.List;
import lombok.Getter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;

/**
 * Cuenta tal como la necesita Spring Security para comprobar la contraseña, más el usuario
 * completo para emitir sus tokens una vez autenticado.
 */
@Getter
class CuentaUsuario extends User {

    private final transient Usuario usuario;

    CuentaUsuario(Usuario usuario) {
        super(usuario.getCorreo(), usuario.getContrasenaHash(),
                List.of(new SimpleGrantedAuthority(usuario.getRol().name())));
        this.usuario = usuario;
    }
}
