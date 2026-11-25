package com.audi.store.shared.security;

/**
 * Quién hace la solicitud, tal como lo dice su token de acceso. Es el {@code principal} de la
 * autenticación y los controladores lo reciben con {@code @AuthenticationPrincipal}.
 *
 * @param rol autoridad de Spring Security: ROLE_ADMIN, ROLE_VENDEDOR o ROLE_CLIENTE
 */
public record UsuarioAutenticado(Long id, String correo, String rol) {
}
