package com.audi.store.usuarios.internal.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.audi.store.shared.config.CorsConfig;
import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.security.JwtService;
import com.audi.store.shared.security.SecurityConfig;
import com.audi.store.shared.security.TokenDePrueba;
import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.domain.Usuario;
import com.audi.store.usuarios.internal.service.DatosUsuario;
import com.audi.store.usuarios.internal.service.UsuarioService;
import java.time.LocalDateTime;
import java.util.List;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(UsuarioController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class UsuarioControllerTest {

    private static final String RUTA = "/api/v1/usuarios";
    private static final String JSON_VALIDO = """
            {"nombre":"Vera","correo":"vera@duoc.cl","contrasena":"abcd","rol":"ROLE_VENDEDOR"}""";

    private static final String JSON_ACTUALIZACION = """
            {"nombre":"Vera","correo":"vera@duoc.cl","rol":"ROLE_VENDEDOR"}""";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JwtService jwt;
    @MockitoBean
    private UsuarioService usuarioService;

    @Test
    void elAdministradorActualizaConSuIdComoSolicitanteYSinContrasenaConservaLaActual() throws Exception {
        when(usuarioService.actualizar(eq(4L), any(), eq(1L))).thenReturn(usuario(4L, "vera@duoc.cl", Rol.ROLE_VENDEDOR));

        mvc.perform(put(RUTA + "/4").with(TokenDePrueba.admin(jwt))
                        .contentType(MediaType.APPLICATION_JSON).content(JSON_ACTUALIZACION))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rol").value("ROLE_VENDEDOR"));

        ArgumentCaptor<DatosUsuario> datos = ArgumentCaptor.forClass(DatosUsuario.class);
        verify(usuarioService).actualizar(eq(4L), datos.capture(), eq(1L));
        assertThat(datos.getValue().contrasena()).isNull();
    }

    @Test
    void unaContrasenaNuevaDemasiadoCortaResponde400() throws Exception {
        String corta = """
                {"nombre":"Vera","correo":"vera@duoc.cl","contrasena":"12","rol":"ROLE_VENDEDOR"}""";

        mvc.perform(put(RUTA + "/4").with(TokenDePrueba.admin(jwt)).contentType(MediaType.APPLICATION_JSON).content(corta))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles[?(@ =~ /contrasena:.*/)]").exists());
        verifyNoInteractions(usuarioService);
    }

    @Test
    void elAdministradorEliminaUnaCuentaYResponde204() throws Exception {
        mvc.perform(delete(RUTA + "/4").with(TokenDePrueba.admin(jwt))).andExpect(status().isNoContent());

        verify(usuarioService).eliminar(4L, 1L);
    }

    @Test
    void elAdministradorNoPuedeEliminarSuPropiaCuenta() throws Exception {
        doThrow(new ConflictoException("No puedes eliminar tu propia cuenta")).when(usuarioService).eliminar(1L, 1L);

        mvc.perform(delete(RUTA + "/1").with(TokenDePrueba.admin(jwt)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.mensaje").value("No puedes eliminar tu propia cuenta"));
    }

    @Test
    void conTokenRealNiElVendedorNiElClienteModificanUsuarios() throws Exception {
        mvc.perform(put(RUTA + "/4").with(TokenDePrueba.vendedor(jwt))
                        .contentType(MediaType.APPLICATION_JSON).content(JSON_ACTUALIZACION))
                .andExpect(status().isForbidden());
        mvc.perform(delete(RUTA + "/4").with(TokenDePrueba.cliente(jwt))).andExpect(status().isForbidden());
        mvc.perform(delete(RUTA + "/4")).andExpect(status().isUnauthorized());
        verifyNoInteractions(usuarioService);
    }

    @Test
    void sinSesionResponde401() throws Exception {
        mvc.perform(get(RUTA)).andExpect(status().isUnauthorized());
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(usuarioService);
    }

    @Test
    @WithMockUser(roles = "VENDEDOR")
    void elVendedorNoAdministraUsuarios() throws Exception {
        mvc.perform(get(RUTA)).andExpect(status().isForbidden());
        mvc.perform(get(RUTA + "/1")).andExpect(status().isForbidden());
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isForbidden());
        verifyNoInteractions(usuarioService);
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void elClienteNoAdministraUsuarios() throws Exception {
        mvc.perform(get(RUTA)).andExpect(status().isForbidden());
        verifyNoInteractions(usuarioService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void elAdministradorListaSinExponerContrasenasNiHashes() throws Exception {
        when(usuarioService.listar()).thenReturn(List.of(usuario(1L, "admin@duoc.cl", Rol.ROLE_ADMIN)));

        mvc.perform(get(RUTA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].correo").value("admin@duoc.cl"))
                .andExpect(jsonPath("$[0].rol").value("ROLE_ADMIN"))
                .andExpect(content().string(Matchers.not(Matchers.containsStringIgnoringCase("contrasena"))))
                .andExpect(content().string(Matchers.not(Matchers.containsStringIgnoringCase("hash"))))
                .andExpect(content().string(Matchers.not(Matchers.containsString("$2a$"))));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void elAdministradorCreaUnUsuario() throws Exception {
        when(usuarioService.crear(any())).thenReturn(usuario(4L, "vera@duoc.cl", Rol.ROLE_VENDEDOR));

        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(4))
                .andExpect(jsonPath("$.contrasena").doesNotExist());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void datosInvalidosResponden400() throws Exception {
        String invalido = """
                {"nombre":"Vera","correo":"no-es-un-correo","contrasena":"123","rol":"ROLE_VENDEDOR"}""";

        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(invalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles[?(@ =~ /correo:.*/)]").exists())
                .andExpect(jsonPath("$.detalles[?(@ =~ /contrasena:.*/)]").exists());
        verifyNoInteractions(usuarioService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unRolInexistenteResponde400() throws Exception {
        String rolInvalido = """
                {"nombre":"Vera","correo":"vera@duoc.cl","contrasena":"abcd","rol":"ROLE_JEFE"}""";

        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(rolInvalido))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(usuarioService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unCorreoYaRegistradoResponde409() throws Exception {
        when(usuarioService.crear(any())).thenThrow(new ConflictoException("El correo vera@duoc.cl ya está registrado"));

        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isConflict());
    }

    private static Usuario usuario(Long id, String correo, Rol rol) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setNombre("Usuario " + id);
        u.setCorreo(correo);
        u.setContrasenaHash("$2a$10$hashquenodebeverseenlarespuesta");
        u.setRol(rol);
        u.setCreadoEn(LocalDateTime.of(2026, 11, 24, 12, 0));
        return u;
    }
}
