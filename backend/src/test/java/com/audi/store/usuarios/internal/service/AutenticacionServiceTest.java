package com.audi.store.usuarios.internal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.audi.store.shared.error.NoAutenticadoException;
import com.audi.store.shared.security.JwtProperties;
import com.audi.store.shared.security.JwtService;
import com.audi.store.shared.security.UsuarioAutenticado;
import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.domain.Usuario;
import com.audi.store.usuarios.internal.repository.UsuarioRepository;
import java.time.Clock;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@ExtendWith(MockitoExtension.class)
class AutenticacionServiceTest {

    @Mock
    private AuthenticationManager autenticador;
    @Mock
    private UsuarioService usuarioService;
    @Mock
    private UsuarioRepository usuarioRepository;

    // JwtService real: lo que importa aquí es qué datos terminan dentro del token.
    private final JwtService jwt = new JwtService(
            new JwtProperties(Base64.getEncoder().encodeToString(new byte[32]), Duration.ofMinutes(15), Duration.ofDays(7)),
            Clock.systemUTC());

    private AutenticacionService servicio;

    @BeforeEach
    void preparar() {
        servicio = new AutenticacionService(autenticador, usuarioService, usuarioRepository, jwt);
    }

    @Test
    void conCredencialesCorrectasElTokenLlevaElIdElCorreoYElRol() {
        Usuario vendedor = usuario(2L, Rol.ROLE_VENDEDOR);
        when(autenticador.authenticate(any())).thenReturn(
                UsernamePasswordAuthenticationToken.authenticated(new CuentaUsuario(vendedor), null, List.of()));

        Sesion sesion = servicio.iniciarSesion("vendedor@duoc.cl", "1234");

        assertThat(sesion.usuario()).isSameAs(vendedor);
        assertThat(jwt.validarAcceso(sesion.tokens().acceso()))
                .isEqualTo(new UsuarioAutenticado(2L, "usuario2@duoc.cl", "ROLE_VENDEDOR"));
        assertThat(jwt.validarRefresco(sesion.tokens().refresco())).isEqualTo(2L);
    }

    @Test
    void conCredencialesIncorrectasElMensajeNoDiceSiElCorreoExiste() {
        when(autenticador.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> servicio.iniciarSesion("nadie@duoc.cl", "1234"))
                .isInstanceOf(NoAutenticadoException.class)
                .hasMessage("Correo o contraseña incorrectos");
    }

    @Test
    void elRegistroDejaLaSesionIniciadaComoCliente() {
        when(usuarioService.registrar("Ana", "ana@gmail.com", "abcd")).thenReturn(usuario(7L, Rol.ROLE_CLIENTE));

        Sesion sesion = servicio.registrar("Ana", "ana@gmail.com", "abcd");

        assertThat(jwt.validarAcceso(sesion.tokens().acceso()).rol()).isEqualTo("ROLE_CLIENTE");
        verifyNoInteractions(autenticador);
    }

    @Test
    void elRefrescoReleeAlUsuarioYElTokenNuevoTraeSuRolActual() {
        String refresco = jwt.emitir(new UsuarioAutenticado(4L, "usuario4@duoc.cl", "ROLE_CLIENTE")).refresco();
        // Mientras tanto, el administrador lo ascendió a vendedor.
        when(usuarioRepository.findById(4L)).thenReturn(Optional.of(usuario(4L, Rol.ROLE_VENDEDOR)));

        Sesion sesion = servicio.refrescar(refresco);

        assertThat(jwt.validarAcceso(sesion.tokens().acceso()).rol()).isEqualTo("ROLE_VENDEDOR");
    }

    @Test
    void elRefrescoDeUnaCuentaEliminadaResponde401() {
        String refresco = jwt.emitir(new UsuarioAutenticado(4L, "usuario4@duoc.cl", "ROLE_CLIENTE")).refresco();
        when(usuarioRepository.findById(4L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.refrescar(refresco))
                .isInstanceOf(NoAutenticadoException.class)
                .hasMessageContaining("ya no existe");
    }

    @Test
    void unTokenDeAccesoNoSirveParaRefrescar() {
        String acceso = jwt.emitir(new UsuarioAutenticado(4L, "usuario4@duoc.cl", "ROLE_CLIENTE")).acceso();

        assertThatThrownBy(() -> servicio.refrescar(acceso)).isInstanceOf(NoAutenticadoException.class);
        verifyNoInteractions(usuarioRepository);
    }

    private static Usuario usuario(Long id, Rol rol) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setNombre("Usuario " + id);
        u.setCorreo("usuario" + id + "@duoc.cl");
        u.setContrasenaHash("$2a$10$hash");
        u.setRol(rol);
        return u;
    }
}
