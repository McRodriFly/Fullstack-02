package com.audi.store.shared.security;

import com.audi.store.shared.error.NoAutenticadoException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;

/**
 * Emite y valida los JWT de la API, firmados con HMAC-SHA256.
 *
 * <p>Hay dos tipos de token, distinguidos por el claim {@code tipo}:
 *
 * <ul>
 *   <li><b>Acceso</b> (15 minutos por defecto): lleva el id del usuario en {@code sub}, más su
 *       correo y su rol. El filtro {@link JwtAuthFilter} arma la sesión solo con estos datos, sin
 *       consultar la base de datos.</li>
 *   <li><b>Refresco</b> (7 días por defecto): lleva solo el id. Únicamente sirve para pedir un par
 *       nuevo; quien lo canjea vuelve a leer al usuario, así que un cambio de rol o una cuenta
 *       eliminada se notan, a más tardar, cuando vence el token de acceso.</li>
 * </ul>
 *
 * <p>Los tokens no se guardan en el servidor: cerrar sesión es descartarlos en el cliente.
 */
public class JwtService {

    private static final String EMISOR = "audi-f1-api";
    private static final String CLAIM_TIPO = "tipo";
    private static final String CLAIM_CORREO = "correo";
    private static final String CLAIM_ROL = "rol";
    private static final String TIPO_ACCESO = "acceso";
    private static final String TIPO_REFRESCO = "refresco";

    private final SecretKey clave;
    private final Duration duracionAcceso;
    private final Duration duracionRefresco;
    private final Clock reloj;
    private final JwtParser parser;

    /**
     * @throws IllegalStateException si falta la clave o no sirve para HMAC-SHA256; así la
     *                               aplicación no arranca con una configuración insegura
     */
    public JwtService(JwtProperties propiedades, Clock reloj) {
        this.clave = claveDesde(propiedades.secreto());
        this.duracionAcceso = propiedades.duracionAcceso();
        this.duracionRefresco = propiedades.duracionRefresco();
        this.reloj = reloj;
        this.parser = Jwts.parser()
                .verifyWith(clave)
                .requireIssuer(EMISOR)
                .clock(() -> Date.from(reloj.instant()))
                .build();
    }

    /** Emite un token de acceso y uno de refresco para el usuario. */
    public TokensEmitidos emitir(UsuarioAutenticado usuario) {
        Instant ahora = reloj.instant();
        String acceso = Jwts.builder()
                .issuer(EMISOR)
                .subject(usuario.id().toString())
                .claim(CLAIM_TIPO, TIPO_ACCESO)
                .claim(CLAIM_CORREO, usuario.correo())
                .claim(CLAIM_ROL, usuario.rol())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(duracionAcceso)))
                .signWith(clave)
                .compact();
        String refresco = Jwts.builder()
                .issuer(EMISOR)
                .subject(usuario.id().toString())
                .claim(CLAIM_TIPO, TIPO_REFRESCO)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(duracionRefresco)))
                .signWith(clave)
                .compact();
        return new TokensEmitidos(acceso, refresco, duracionAcceso.toSeconds());
    }

    /**
     * Valida un token de acceso y devuelve a quién pertenece.
     *
     * @throws NoAutenticadoException si el token venció, está alterado, no lo emitió esta API o es
     *                                de refresco
     */
    public UsuarioAutenticado validarAcceso(String token) {
        Claims claims = leer(token, TIPO_ACCESO);
        String correo = claims.get(CLAIM_CORREO, String.class);
        String rol = claims.get(CLAIM_ROL, String.class);
        if (correo == null || rol == null) {
            throw new NoAutenticadoException("El token de sesión no es válido");
        }
        return new UsuarioAutenticado(idDe(claims), correo, rol);
    }

    /**
     * Valida un token de refresco y devuelve el id de su usuario.
     *
     * @throws NoAutenticadoException si el token venció, está alterado, no lo emitió esta API o es
     *                                de acceso
     */
    public Long validarRefresco(String token) {
        return idDe(leer(token, TIPO_REFRESCO));
    }

    private Claims leer(String token, String tipoEsperado) {
        Claims claims;
        try {
            claims = parser.parseSignedClaims(token).getPayload();
        } catch (ExpiredJwtException e) {
            throw new NoAutenticadoException("Tu sesión expiró; vuelve a iniciar sesión", e);
        } catch (JwtException | IllegalArgumentException e) {
            throw new NoAutenticadoException("El token de sesión no es válido", e);
        }
        // Sin esta comprobación, el token de refresco (de 7 días) serviría como token de acceso.
        if (!tipoEsperado.equals(claims.get(CLAIM_TIPO, String.class))) {
            throw new NoAutenticadoException("El token de sesión no es válido");
        }
        return claims;
    }

    private static Long idDe(Claims claims) {
        try {
            return Long.valueOf(claims.getSubject());
        } catch (NumberFormatException e) {
            throw new NoAutenticadoException("El token de sesión no es válido", e);
        }
    }

    private static SecretKey claveDesde(String secreto) {
        if (secreto == null || secreto.isBlank()) {
            throw new IllegalStateException(
                    "Falta la clave JWT: define JWT_SECRET en el .env (ver .env.example)");
        }
        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secreto.trim()));
        } catch (RuntimeException e) {
            throw new IllegalStateException(
                    "JWT_SECRET debe ser un texto Base64 de al menos 32 bytes (ver .env.example)", e);
        }
    }
}
