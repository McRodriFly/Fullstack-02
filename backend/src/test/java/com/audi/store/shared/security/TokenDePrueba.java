package com.audi.store.shared.security;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

/**
 * Agrega a una solicitud de MockMvc un encabezado {@code Authorization: Bearer} con un token real,
 * firmado con la misma clave que la aplicación de prueba. Así las pruebas recorren el filtro JWT
 * completo en vez de simular la sesión.
 */
public final class TokenDePrueba {

    private TokenDePrueba() {
    }

    public static RequestPostProcessor admin(JwtService jwt) {
        return como(jwt, 1L, "admin@duoc.cl", "ROLE_ADMIN");
    }

    public static RequestPostProcessor vendedor(JwtService jwt) {
        return como(jwt, 2L, "vendedor@duoc.cl", "ROLE_VENDEDOR");
    }

    public static RequestPostProcessor cliente(JwtService jwt) {
        return como(jwt, 3L, "cliente@gmail.com", "ROLE_CLIENTE");
    }

    public static RequestPostProcessor como(JwtService jwt, Long id, String correo, String rol) {
        return bearer(jwt.emitir(new UsuarioAutenticado(id, correo, rol)).acceso());
    }

    /** Un token de acceso del cliente emitido hace una hora, que ya venció. */
    public static RequestPostProcessor clienteVencido(JwtProperties propiedades) {
        Clock haceUnaHora = Clock.fixed(Instant.now().minus(Duration.ofHours(1)), ZoneOffset.UTC);
        String token = new JwtService(propiedades, haceUnaHora)
                .emitir(new UsuarioAutenticado(3L, "cliente@gmail.com", "ROLE_CLIENTE")).acceso();
        return bearer(token);
    }

    public static RequestPostProcessor bearer(String token) {
        return request -> {
            request.addHeader(HttpHeaders.AUTHORIZATION, "Bearer " + token);
            return request;
        };
    }
}
