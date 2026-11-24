package com.audi.store.usuarios.api;

import com.audi.store.shared.error.RecursoNoEncontradoException;

/** Contrato que el módulo usuarios ofrece a los demás módulos. */
public interface UsuariosApi {

    /**
     * Busca un usuario por su id.
     *
     * @throws RecursoNoEncontradoException si el usuario no existe
     */
    UsuarioResumen obtenerUsuario(Long id);
}
