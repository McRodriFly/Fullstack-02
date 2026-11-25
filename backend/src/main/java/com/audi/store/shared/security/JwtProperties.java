package com.audi.store.shared.security;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Configuración de los tokens ({@code app.jwt.*} en {@code application.yml}).
 *
 * @param secreto          clave HMAC en Base64, de al menos 32 bytes; viene de la variable de
 *                         entorno {@code JWT_SECRET} y nunca del código
 * @param duracionAcceso   vigencia del token que acompaña cada solicitud
 * @param duracionRefresco vigencia del token que solo sirve para pedir uno de acceso nuevo
 */
@ConfigurationProperties("app.jwt")
public record JwtProperties(
        String secreto,
        @DefaultValue("15m") Duration duracionAcceso,
        @DefaultValue("7d") Duration duracionRefresco) {
}
