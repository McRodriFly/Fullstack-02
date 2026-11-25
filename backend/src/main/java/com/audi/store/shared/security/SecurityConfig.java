package com.audi.store.shared.security;

import com.audi.store.shared.error.GlobalExceptionHandler;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

/**
 * Cadena de filtros de la API: sin estado (cada solicitud lleva su token) y cerrada por defecto.
 *
 * <p>Solo son públicas las rutas de la matriz de permisos marcadas como tales y la documentación
 * Swagger; cualquier otra exige sesión. El permiso fino por rol se declara en cada endpoint con
 * {@code @PreAuthorize}.
 *
 * <p>Los rechazos que ocurren en los filtros (401 y 403), antes de llegar a un controlador, se
 * entregan al {@link GlobalExceptionHandler} para que respondan con el mismo formato de error que
 * el resto de la API.
 */
@Configuration
@EnableMethodSecurity
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

    @Bean
    public JwtService jwtService(JwtProperties propiedades) {
        return new JwtService(propiedades, Clock.systemUTC());
    }

    @Bean
    SecurityFilterChain filtros(
            HttpSecurity http,
            JwtService jwtService,
            @Qualifier("handlerExceptionResolver") HandlerExceptionResolver resolvedor) throws Exception {
        http
                // Sin cookies de sesión no hay riesgo de CSRF; la autenticación va en un encabezado.
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(rutas -> rutas
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/productos/**", "/api/v1/categorias/**").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(e -> e
                        // Sin sesión: 401 (por defecto Spring respondería 403), con el motivo del rechazo.
                        .authenticationEntryPoint((request, response, excepcion) ->
                                resolvedor.resolveException(request, response, null, motivo(request, excepcion)))
                        .accessDeniedHandler((request, response, excepcion) ->
                                resolvedor.resolveException(request, response, null, excepcion)));
        return http.build();
    }

    // Si el filtro JWT rechazó un token (vencido, alterado), ese motivo es más útil que "sin sesión".
    private static AuthenticationException motivo(
            HttpServletRequest request, AuthenticationException porDefecto) {
        return request.getAttribute(JwtAuthFilter.ATRIBUTO_ERROR) instanceof AuthenticationException rechazo
                ? rechazo
                : porDefecto;
    }
}
