package com.audi.store.usuarios.internal.web.dto;

import com.audi.store.usuarios.internal.service.Sesion;

/**
 * Tokens de una sesión recién abierta y los datos del usuario, para que el frontend sepa qué
 * mostrarle según su rol.
 *
 * @param tokenAcceso   se envía en {@code Authorization: Bearer} en cada solicitud
 * @param tokenRefresco se canjea en {@code POST /api/v1/auth/refresh} cuando el de acceso vence
 * @param tipoToken     siempre {@code Bearer}
 * @param expiraEn      segundos de vigencia del token de acceso
 */
public record SesionResponse(
        String tokenAcceso,
        String tokenRefresco,
        String tipoToken,
        long expiraEn,
        UsuarioResponse usuario) {

    public static SesionResponse desde(Sesion sesion) {
        return new SesionResponse(
                sesion.tokens().acceso(),
                sesion.tokens().refresco(),
                "Bearer",
                sesion.tokens().accesoExpiraEn(),
                UsuarioResponse.desde(sesion.usuario()));
    }
}
