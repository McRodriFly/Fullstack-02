package com.audi.store.shared.security;

/**
 * Par de tokens que se entrega al iniciar sesión, al registrarse y al refrescar.
 *
 * @param acceso           va en {@code Authorization: Bearer} de cada solicitud
 * @param refresco         solo sirve en {@code POST /api/v1/auth/refresh}
 * @param accesoExpiraEn   segundos de vigencia del token de acceso
 */
public record TokensEmitidos(String acceso, String refresco, long accesoExpiraEn) {
}
