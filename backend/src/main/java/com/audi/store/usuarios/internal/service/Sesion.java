package com.audi.store.usuarios.internal.service;

import com.audi.store.shared.security.TokensEmitidos;
import com.audi.store.usuarios.internal.domain.Usuario;

/** Resultado de iniciar sesión, registrarse o refrescar: el usuario y sus tokens. */
public record Sesion(Usuario usuario, TokensEmitidos tokens) {
}
