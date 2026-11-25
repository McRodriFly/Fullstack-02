package com.audi.store.usuarios.internal.web.dto;

import com.audi.store.usuarios.internal.service.Sesion;
import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Tokens de una sesión recién abierta y los datos del usuario, para que el frontend sepa qué
 * mostrarle según su rol.
 *
 * @param tokenAcceso   se envía en {@code Authorization: Bearer} en cada solicitud
 * @param tokenRefresco se canjea en {@code POST /api/v1/auth/refresh} cuando el de acceso vence
 * @param tipoToken     siempre {@code Bearer}
 * @param expiraEn      segundos de vigencia del token de acceso
 */
@Schema(description = "Sesión abierta: los dos tokens y los datos del usuario.")
public record SesionResponse(
        @Schema(description = "Token de acceso (15 minutos). Se envía en el encabezado Authorization: Bearer.",
                example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sIjoiUk9MRV9DTElFTlRFIn0.firma")
        String tokenAcceso,
        @Schema(description = "Token de refresco (7 días). Solo sirve en POST /auth/refresh.",
                example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.firma")
        String tokenRefresco,
        @Schema(description = "Tipo de token; siempre Bearer.", example = "Bearer") String tipoToken,
        @Schema(description = "Segundos de vigencia del token de acceso.", example = "900") long expiraEn,
        @Schema(description = "Datos del usuario de la sesión.") UsuarioResponse usuario) {

    public static SesionResponse desde(Sesion sesion) {
        return new SesionResponse(
                sesion.tokens().acceso(),
                sesion.tokens().refresco(),
                "Bearer",
                sesion.tokens().accesoExpiraEn(),
                UsuarioResponse.desde(sesion.usuario()));
    }
}
