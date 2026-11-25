package com.audi.store.usuarios.internal.web;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.audi.store.shared.config.CorsConfig;
import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.error.NoAutenticadoException;
import com.audi.store.shared.security.SecurityConfig;
import com.audi.store.shared.security.TokensEmitidos;
import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.domain.Usuario;
import com.audi.store.usuarios.internal.service.AutenticacionService;
import com.audi.store.usuarios.internal.service.Sesion;
import java.time.LocalDateTime;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AutenticacionController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class AutenticacionControllerTest {

    private static final String RUTA = "/api/v1/auth";

    @Autowired
    private MockMvc mvc;
    @MockitoBean
    private AutenticacionService autenticacionService;

    @Test
    void elLoginEsPublicoYDevuelveLosTokensYElUsuarioSinSuHash() throws Exception {
        when(autenticacionService.iniciarSesion("cliente@gmail.com", "1234")).thenReturn(sesion(Rol.ROLE_CLIENTE));

        mvc.perform(post(RUTA + "/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"correo":"cliente@gmail.com","contrasena":"1234"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenAcceso").value("acceso"))
                .andExpect(jsonPath("$.tokenRefresco").value("refresco"))
                .andExpect(jsonPath("$.tipoToken").value("Bearer"))
                .andExpect(jsonPath("$.expiraEn").value(900))
                .andExpect(jsonPath("$.usuario.id").value(3))
                .andExpect(jsonPath("$.usuario.rol").value("ROLE_CLIENTE"))
                .andExpect(content().string(Matchers.not(Matchers.containsString("$2a$"))))
                .andExpect(content().string(Matchers.not(Matchers.containsStringIgnoringCase("hash"))));
    }

    @Test
    void credencialesIncorrectasResponden401ConElFormatoComun() throws Exception {
        when(autenticacionService.iniciarSesion("cliente@gmail.com", "mala"))
                .thenThrow(new NoAutenticadoException("Correo o contraseña incorrectos"));

        mvc.perform(post(RUTA + "/login").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"correo":"cliente@gmail.com","contrasena":"mala"}"""))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.estado").value(401))
                .andExpect(jsonPath("$.mensaje").value("Correo o contraseña incorrectos"))
                .andExpect(jsonPath("$.ruta").value(RUTA + "/login"));
    }

    @Test
    void unLoginIncompletoResponde400() throws Exception {
        mvc.perform(post(RUTA + "/login").contentType(MediaType.APPLICATION_JSON).content("{\"correo\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles[?(@ =~ /correo:.*/)]").exists())
                .andExpect(jsonPath("$.detalles[?(@ =~ /contrasena:.*/)]").exists());
        verifyNoInteractions(autenticacionService);
    }

    @Test
    void elRegistroCreaUnClienteYDejaLaSesionIniciada() throws Exception {
        when(autenticacionService.registrar("Ana", "ana@gmail.com", "abcd")).thenReturn(sesion(Rol.ROLE_CLIENTE));

        mvc.perform(post(RUTA + "/registro").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Ana","correo":"ana@gmail.com","contrasena":"abcd"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tokenAcceso").exists())
                .andExpect(jsonPath("$.usuario.rol").value("ROLE_CLIENTE"));
    }

    @Test
    void elRegistroIgnoraUnRolEnviadoPorElCliente() throws Exception {
        // RegistroRequest no tiene campo rol: el JSON lo trae, pero nunca llega al servicio.
        when(autenticacionService.registrar("Ana", "ana@gmail.com", "abcd")).thenReturn(sesion(Rol.ROLE_CLIENTE));

        mvc.perform(post(RUTA + "/registro").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Ana","correo":"ana@gmail.com","contrasena":"abcd","rol":"ROLE_ADMIN"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usuario.rol").value("ROLE_CLIENTE"));
    }

    @Test
    void unRegistroConCorreoRepetidoResponde409YUnoInvalido400() throws Exception {
        when(autenticacionService.registrar("Ana", "ana@gmail.com", "abcd"))
                .thenThrow(new ConflictoException("El correo ana@gmail.com ya está registrado"));

        mvc.perform(post(RUTA + "/registro").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Ana","correo":"ana@gmail.com","contrasena":"abcd"}"""))
                .andExpect(status().isConflict());
        mvc.perform(post(RUTA + "/registro").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Ana","correo":"no-es-correo","contrasena":"12"}"""))
                .andExpect(status().isBadRequest());
    }

    @Test
    void elRefrescoCanjeaElTokenOResponde401() throws Exception {
        when(autenticacionService.refrescar("bueno")).thenReturn(sesion(Rol.ROLE_ADMIN));
        when(autenticacionService.refrescar("vencido"))
                .thenThrow(new NoAutenticadoException("Tu sesión expiró; vuelve a iniciar sesión"));

        mvc.perform(post(RUTA + "/refresh").contentType(MediaType.APPLICATION_JSON).content("{\"tokenRefresco\":\"bueno\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.rol").value("ROLE_ADMIN"));
        mvc.perform(post(RUTA + "/refresh").contentType(MediaType.APPLICATION_JSON).content("{\"tokenRefresco\":\"vencido\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Tu sesión expiró; vuelve a iniciar sesión"));
    }

    private static Sesion sesion(Rol rol) {
        Usuario u = new Usuario();
        u.setId(3L);
        u.setNombre("Cliente");
        u.setCorreo("cliente@gmail.com");
        u.setContrasenaHash("$2a$10$hashquenodebeverseenlarespuesta");
        u.setRol(rol);
        u.setCreadoEn(LocalDateTime.of(2026, 11, 24, 12, 0));
        return new Sesion(u, new TokensEmitidos("acceso", "refresco", 900));
    }
}
