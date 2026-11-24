package com.audi.store.usuarios.internal.service;

import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.usuarios.api.UsuarioResumen;
import com.audi.store.usuarios.api.UsuariosApi;
import com.audi.store.usuarios.internal.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Implementación de la fachada de usuarios para los demás módulos. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
class UsuariosApiService implements UsuariosApi {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UsuarioResumen obtenerUsuario(Long id) {
        return usuarioRepository.findById(id)
                .map(u -> new UsuarioResumen(u.getId(), u.getCorreo(), u.getNombre(), u.getRol().name()))
                .orElseThrow(() -> new RecursoNoEncontradoException("El usuario " + id + " no existe"));
    }
}
