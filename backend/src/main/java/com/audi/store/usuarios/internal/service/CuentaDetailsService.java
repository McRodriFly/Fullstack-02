package com.audi.store.usuarios.internal.service;

import com.audi.store.usuarios.internal.repository.UsuarioRepository;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Busca la cuenta por correo cuando Spring Security valida un inicio de sesión. */
@Service
@RequiredArgsConstructor
class CuentaDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String correo) {
        return usuarioRepository.findByCorreo(correo.trim().toLowerCase(Locale.ROOT))
                .map(CuentaUsuario::new)
                .orElseThrow(() -> new UsernameNotFoundException("Cuenta inexistente"));
    }
}
