package com.audi.store.shared.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.audi.store.shared.error.NoAutenticadoException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.Date;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRETO = Base64.getEncoder().encodeToString(new byte[32]);
    private static final Instant AHORA = Instant.parse("2026-11-24T12:00:00Z");
    private static final UsuarioAutenticado CLIENTE = new UsuarioAutenticado(3L, "cliente@gmail.com", "ROLE_CLIENTE");

    private final JwtService jwt = servicioEn(AHORA);

    @Test
    void elTokenDeAccesoDevuelveAlUsuarioConSuRol() {
        TokensEmitidos tokens = jwt.emitir(CLIENTE);

        assertThat(jwt.validarAcceso(tokens.acceso())).isEqualTo(CLIENTE);
        assertThat(tokens.accesoExpiraEn()).isEqualTo(15 * 60);
    }

    @Test
    void elTokenDeRefrescoDevuelveSoloElId() {
        assertThat(jwt.validarRefresco(jwt.emitir(CLIENTE).refresco())).isEqualTo(3L);
    }

    @Test
    void unTokenNoSirveComoElDeOtroTipo() {
        TokensEmitidos tokens = jwt.emitir(CLIENTE);

        assertThatThrownBy(() -> jwt.validarAcceso(tokens.refresco()))
                .isInstanceOf(NoAutenticadoException.class)
                .hasMessage("El token de sesión no es válido");
        assertThatThrownBy(() -> jwt.validarRefresco(tokens.acceso()))
                .isInstanceOf(NoAutenticadoException.class);
    }

    @Test
    void elTokenDeAccesoVenceALos15MinutosYElDeRefrescoALos7Dias() {
        TokensEmitidos tokens = jwt.emitir(CLIENTE);

        assertThat(servicioEn(AHORA.plus(Duration.ofMinutes(14))).validarAcceso(tokens.acceso())).isEqualTo(CLIENTE);
        assertThatThrownBy(() -> servicioEn(AHORA.plus(Duration.ofMinutes(16))).validarAcceso(tokens.acceso()))
                .isInstanceOf(NoAutenticadoException.class)
                .hasMessage("Tu sesión expiró; vuelve a iniciar sesión");

        assertThat(servicioEn(AHORA.plus(Duration.ofDays(6))).validarRefresco(tokens.refresco())).isEqualTo(3L);
        assertThatThrownBy(() -> servicioEn(AHORA.plus(Duration.ofDays(8))).validarRefresco(tokens.refresco()))
                .isInstanceOf(NoAutenticadoException.class);
    }

    @Test
    void unTokenAlteradoSeRechaza() {
        String acceso = jwt.emitir(CLIENTE).acceso();
        // Cambia el rol en el contenido sin volver a firmar: la firma deja de coincidir.
        String[] partes = acceso.split("\\.");
        String contenido = new String(Base64.getUrlDecoder().decode(partes[1])).replace("ROLE_CLIENTE", "ROLE_ADMIN");
        String alterado = partes[0] + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(contenido.getBytes())
                + "." + partes[2];

        assertThatThrownBy(() -> jwt.validarAcceso(alterado)).isInstanceOf(NoAutenticadoException.class);
    }

    @Test
    void unTokenFirmadoConOtraClaveOSinEmisorSeRechaza() {
        String otraClave = Jwts.builder()
                .issuer("audi-f1-api").subject("1").claim("tipo", "acceso")
                .claim("correo", "x@x.cl").claim("rol", "ROLE_ADMIN")
                .expiration(Date.from(AHORA.plusSeconds(60)))
                .signWith(Keys.hmacShaKeyFor(new byte[] {
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                    17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32}))
                .compact();
        String sinEmisor = Jwts.builder()
                .subject("1").claim("tipo", "acceso").claim("correo", "x@x.cl").claim("rol", "ROLE_ADMIN")
                .expiration(Date.from(AHORA.plusSeconds(60)))
                .signWith(Keys.hmacShaKeyFor(Base64.getDecoder().decode(SECRETO)))
                .compact();

        assertThatThrownBy(() -> jwt.validarAcceso(otraClave)).isInstanceOf(NoAutenticadoException.class);
        assertThatThrownBy(() -> jwt.validarAcceso(sinEmisor)).isInstanceOf(NoAutenticadoException.class);
        assertThatThrownBy(() -> jwt.validarAcceso("esto-no-es-un-jwt")).isInstanceOf(NoAutenticadoException.class);
    }

    @Test
    void sinClaveOConUnaClaveCortaLaAplicacionNoArranca() {
        assertThatThrownBy(() -> new JwtService(propiedades(""), Clock.systemUTC()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("JWT_SECRET");
        String corta = Base64.getEncoder().encodeToString(new byte[16]);
        assertThatThrownBy(() -> new JwtService(propiedades(corta), Clock.systemUTC()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
        assertThatThrownBy(() -> new JwtService(propiedades("cambiar"), Clock.systemUTC()))
                .isInstanceOf(IllegalStateException.class);
    }

    private static JwtService servicioEn(Instant instante) {
        return new JwtService(propiedades(SECRETO), Clock.fixed(instante, ZoneOffset.UTC));
    }

    private static JwtProperties propiedades(String secreto) {
        return new JwtProperties(secreto, Duration.ofMinutes(15), Duration.ofDays(7));
    }
}
