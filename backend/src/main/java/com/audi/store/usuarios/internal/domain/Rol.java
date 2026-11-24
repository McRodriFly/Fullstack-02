package com.audi.store.usuarios.internal.domain;

/**
 * Rol de un usuario. El nombre coincide con la autoridad de Spring Security y con el valor
 * guardado en la columna {@code usuarios.rol}.
 */
public enum Rol {
    ROLE_ADMIN,
    ROLE_VENDEDOR,
    ROLE_CLIENTE
}
