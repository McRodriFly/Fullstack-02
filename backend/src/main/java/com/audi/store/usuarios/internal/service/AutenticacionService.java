package com.audi.store.usuarios.internal.service;

import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.error.NoAutenticadoException;
import com.audi.store.shared.security.JwtService;
import com.audi.store.shared.security.UsuarioAutenticado;
import com.audi.store.usuarios.internal.domain.Usuario;
import com.audi.store.usuarios.internal.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Inicio de sesión, registro y renovación de tokens. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AutenticacionService {

    private final AuthenticationManager autenticador;
    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    /**
     * Comprueba correo y contraseña y emite un par de tokens.
     *
     * @throws NoAutenticadoException si el correo no existe o la contraseña es incorrecta; el
     *                                mensaje es el mismo en ambos casos
     */
    public Sesion iniciarSesion(String correo, String contrasena) {
        try {
            var autenticacion = autenticador.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(correo, contrasena));
            return abrirSesion(((CuentaUsuario) autenticacion.getPrincipal()).getUsuario());
        } catch (AuthenticationException e) {
            throw new NoAutenticadoException("Correo o contraseña incorrectos", e);
        }
    }

    /**
     * Crea una cuenta de cliente y deja la sesión iniciada.
     *
     * @throws ConflictoException si el correo ya está registrado
     */
    @Transactional
    public Sesion registrar(String nombre, String correo, String contrasena) {
        return abrirSesion(usuarioService.registrar(nombre, correo, contrasena));
    }

    /**
     * Canjea un token de refresco por un par nuevo. Vuelve a leer al usuario, de modo que el token
     * nuevo lleva su rol actual.
     *
     * @throws NoAutenticadoException si el token no es válido o venció, o si la cuenta ya no existe
     */
    public Sesion refrescar(String tokenRefresco) {
        Long id = jwtService.validarRefresco(tokenRefresco);
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NoAutenticadoException("La cuenta ya no existe; inicia sesión de nuevo"));
        return abrirSesion(usuario);
    }

    private Sesion abrirSesion(Usuario usuario) {
        var autenticado = new UsuarioAutenticado(usuario.getId(), usuario.getCorreo(), usuario.getRol().name());
        return new Sesion(usuario, jwtService.emitir(autenticado));
    }
}
