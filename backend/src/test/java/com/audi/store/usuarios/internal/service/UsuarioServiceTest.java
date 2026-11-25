package com.audi.store.usuarios.internal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.domain.Usuario;
import com.audi.store.usuarios.internal.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class UsuarioServiceTest {

    private static final Long ADMIN = 1L;
    private static final Long CLIENTE = 3L;

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @InjectMocks
    private UsuarioService usuarioService;

    @BeforeEach
    void configurar() {
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));
        when(passwordEncoder.encode("abcd")).thenReturn("HASH-ABCD");
        when(passwordEncoder.encode("nueva")).thenReturn("HASH-NUEVA");
    }

    @Test
    void elRegistroPublicoCreaSiempreUnClienteConLaContrasenaCifrada() {
        Usuario creado = usuarioService.registrar(" Ana ", "  Ana@Gmail.COM ", "abcd");

        assertThat(creado.getRol()).isEqualTo(Rol.ROLE_CLIENTE);
        assertThat(creado.getNombre()).isEqualTo("Ana");
        assertThat(creado.getCorreo()).isEqualTo("ana@gmail.com");
        assertThat(creado.getContrasenaHash()).isEqualTo("HASH-ABCD").isNotEqualTo("abcd");
    }

    @Test
    void laAdministracionPuedeCrearCualquierRol() {
        Usuario creado = usuarioService.crear(new DatosUsuario("Vera", "vera@duoc.cl", "abcd", Rol.ROLE_VENDEDOR));

        assertThat(creado.getRol()).isEqualTo(Rol.ROLE_VENDEDOR);
    }

    @Test
    void noCreaUnUsuarioConUnCorreoYaRegistrado() {
        when(usuarioRepository.existsByCorreo("admin@duoc.cl")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.registrar("Otro", "ADMIN@duoc.cl", "abcd"))
                .isInstanceOf(ConflictoException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void exigeContrasenaAlCrear() {
        assertThatThrownBy(() -> usuarioService.crear(new DatosUsuario("Ana", "ana@x.cl", "  ", Rol.ROLE_CLIENTE)))
                .isInstanceOf(SolicitudInvalidaException.class);
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void actualizarSinContrasenaConservaElHashActual() {
        Usuario existente = usuario(CLIENTE, "cliente@gmail.com", Rol.ROLE_CLIENTE);
        when(usuarioRepository.findById(CLIENTE)).thenReturn(Optional.of(existente));

        Usuario actualizado = usuarioService.actualizar(CLIENTE,
                new DatosUsuario("Cliente Nuevo", "Cliente2@gmail.com", null, Rol.ROLE_CLIENTE), ADMIN);

        assertThat(actualizado.getNombre()).isEqualTo("Cliente Nuevo");
        assertThat(actualizado.getCorreo()).isEqualTo("cliente2@gmail.com");
        assertThat(actualizado.getContrasenaHash()).isEqualTo("HASH-ANTIGUO");
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    void actualizarConContrasenaGuardaElHashNuevo() {
        Usuario existente = usuario(CLIENTE, "cliente@gmail.com", Rol.ROLE_CLIENTE);
        when(usuarioRepository.findById(CLIENTE)).thenReturn(Optional.of(existente));

        usuarioService.actualizar(CLIENTE,
                new DatosUsuario("Cliente", "cliente@gmail.com", "nueva", Rol.ROLE_CLIENTE), ADMIN);

        assertThat(existente.getContrasenaHash()).isEqualTo("HASH-NUEVA");
    }

    @Test
    void elAdministradorPuedeCambiarElRolDeOtroUsuario() {
        Usuario existente = usuario(CLIENTE, "cliente@gmail.com", Rol.ROLE_CLIENTE);
        when(usuarioRepository.findById(CLIENTE)).thenReturn(Optional.of(existente));

        usuarioService.actualizar(CLIENTE, new DatosUsuario("Cliente", "cliente@gmail.com", null, Rol.ROLE_VENDEDOR), ADMIN);

        assertThat(existente.getRol()).isEqualTo(Rol.ROLE_VENDEDOR);
    }

    @Test
    void elAdministradorNoPuedeQuitarseSuPropioRol() {
        Usuario admin = usuario(ADMIN, "admin@duoc.cl", Rol.ROLE_ADMIN);
        when(usuarioRepository.findById(ADMIN)).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> usuarioService.actualizar(ADMIN,
                new DatosUsuario("Admin", "admin@duoc.cl", null, Rol.ROLE_CLIENTE), ADMIN))
                .isInstanceOf(ConflictoException.class);
        assertThat(admin.getRol()).isEqualTo(Rol.ROLE_ADMIN);
    }

    @Test
    void noPermiteUsarElCorreoDeOtroUsuario() {
        when(usuarioRepository.findById(CLIENTE))
                .thenReturn(Optional.of(usuario(CLIENTE, "cliente@gmail.com", Rol.ROLE_CLIENTE)));
        when(usuarioRepository.existsByCorreoAndIdNot("admin@duoc.cl", CLIENTE)).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.actualizar(CLIENTE,
                new DatosUsuario("Cliente", "admin@duoc.cl", null, Rol.ROLE_CLIENTE), ADMIN))
                .isInstanceOf(ConflictoException.class);
    }

    @Test
    void elAdministradorNoPuedeEliminarSuPropiaCuenta() {
        assertThatThrownBy(() -> usuarioService.eliminar(ADMIN, ADMIN)).isInstanceOf(ConflictoException.class);
        verifyNoInteractions(usuarioRepository);
    }

    @Test
    void noEliminaUnUsuarioConComprasRegistradas() {
        Usuario conCompras = usuario(CLIENTE, "cliente@gmail.com", Rol.ROLE_CLIENTE);
        when(usuarioRepository.findById(CLIENTE)).thenReturn(Optional.of(conCompras));
        doThrow(new DataIntegrityViolationException("fk_boletas_usuario")).when(usuarioRepository).flush();

        assertThatThrownBy(() -> usuarioService.eliminar(CLIENTE, ADMIN))
                .isInstanceOf(ConflictoException.class)
                .hasMessageContaining("compras");
    }

    @Test
    void eliminaUnUsuarioSinCompras() {
        Usuario libre = usuario(CLIENTE, "cliente@gmail.com", Rol.ROLE_CLIENTE);
        when(usuarioRepository.findById(CLIENTE)).thenReturn(Optional.of(libre));

        usuarioService.eliminar(CLIENTE, ADMIN);

        verify(usuarioRepository).delete(libre);
    }

    @Test
    void unUsuarioInexistenteLanza404() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.obtener(99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    private static Usuario usuario(Long id, String correo, Rol rol) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setNombre("Usuario " + id);
        u.setCorreo(correo);
        u.setContrasenaHash("HASH-ANTIGUO");
        u.setRol(rol);
        return u;
    }
}
