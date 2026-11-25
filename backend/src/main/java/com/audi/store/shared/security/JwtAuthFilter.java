package com.audi.store.shared.security;

import com.audi.store.shared.error.NoAutenticadoException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Lee el encabezado {@code Authorization: Bearer <token>} y, si el token de acceso es válido,
 * deja autenticado al usuario para el resto de la solicitud con el rol que trae el token.
 *
 * <p>Un token inválido o vencido no corta la solicitud aquí: sigue como anónima, de modo que las
 * rutas públicas responden igual. Si la ruta exige sesión, el punto de entrada de
 * {@link SecurityConfig} responde 401 con el motivo que este filtro dejó guardado.
 *
 * <p>No es un {@code @Component} a propósito: Spring Boot registraría cualquier filtro declarado
 * como bean también en el contenedor de servlets, y se ejecutaría dos veces.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    /** Atributo de la solicitud con el {@link NoAutenticadoException} de un token rechazado. */
    static final String ATRIBUTO_ERROR = JwtAuthFilter.class.getName() + ".ERROR";

    private static final String PREFIJO = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain cadena)
            throws ServletException, IOException {
        String encabezado = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (encabezado != null && encabezado.regionMatches(true, 0, PREFIJO, 0, PREFIJO.length())) {
            try {
                autenticar(jwtService.validarAcceso(encabezado.substring(PREFIJO.length()).trim()));
            } catch (NoAutenticadoException e) {
                request.setAttribute(ATRIBUTO_ERROR, e);
            }
        }
        cadena.doFilter(request, response);
    }

    private static void autenticar(UsuarioAutenticado usuario) {
        var autenticacion = UsernamePasswordAuthenticationToken.authenticated(
                usuario, null, List.of(new SimpleGrantedAuthority(usuario.rol())));
        SecurityContext contexto = SecurityContextHolder.createEmptyContext();
        contexto.setAuthentication(autenticacion);
        SecurityContextHolder.setContext(contexto);
    }
}
