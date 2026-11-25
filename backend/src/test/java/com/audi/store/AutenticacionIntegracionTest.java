package com.audi.store;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/**
 * La sesión de punta a punta, solo por HTTP y contra MySQL: las cuentas iniciales inician sesión
 * con BCrypt, el token abre las rutas según el rol, se renueva y el registro deja la sesión lista.
 *
 * <p>Usa el producto 9 (stock 5) y lo deja como estaba.
 */
class AutenticacionIntegracionTest extends IntegracionBase {

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JdbcTemplate jdbc;

    private int stockInicial;

    @BeforeEach
    void recordarStock() {
        stockInicial = jdbc.queryForObject("SELECT stock FROM productos WHERE id = 9", Integer.class);
    }

    @AfterEach
    void restaurar() {
        jdbc.update("DELETE FROM boletas");
        jdbc.update("UPDATE productos SET stock = ? WHERE id = 9", stockInicial);
        jdbc.update("DELETE FROM usuarios WHERE correo = 'nueva@gmail.com'");
    }

    @Test
    void lasTresCuentasInicialesEntranConSuRol() throws Exception {
        login("admin@duoc.cl", "1234").andExpect(status().isOk()).andExpect(jsonPath("$.usuario.rol").value("ROLE_ADMIN"));
        login("vendedor@duoc.cl", "1234").andExpect(status().isOk()).andExpect(jsonPath("$.usuario.rol").value("ROLE_VENDEDOR"));
        // El correo no distingue mayúsculas ni espacios alrededor.
        login(" Cliente@Gmail.com ", "1234").andExpect(status().isOk())
                .andExpect(jsonPath("$.usuario.rol").value("ROLE_CLIENTE"))
                .andExpect(content().string(Matchers.not(Matchers.containsString("$2a$"))));
    }

    @Test
    void contrasenaIncorrectaYCorreoInexistenteRespondenLoMismo() throws Exception {
        login("admin@duoc.cl", "12345").andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Correo o contraseña incorrectos"));
        login("nadie@duoc.cl", "1234").andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Correo o contraseña incorrectos"));
    }

    @Test
    void elClienteCompraVeSusBoletasYRenuevaSuToken() throws Exception {
        String sesion = login("cliente@gmail.com", "1234").andReturn().getResponse().getContentAsString();
        String acceso = JsonPath.read(sesion, "$.tokenAcceso");
        String refresco = JsonPath.read(sesion, "$.tokenRefresco");

        mvc.perform(post("/api/v1/boletas").header(HttpHeaders.AUTHORIZATION, "Bearer " + acceso)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"items":[{"productoId":9,"cantidad":1}],"tipoEntrega":"RETIRO"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usuarioId").value(3))
                .andExpect(jsonPath("$.total").value(45000));
        mvc.perform(get("/api/v1/boletas/mias").header(HttpHeaders.AUTHORIZATION, "Bearer " + acceso))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/v1/boletas").header(HttpHeaders.AUTHORIZATION, "Bearer " + acceso))
                .andExpect(status().isForbidden());

        String renovada = mvc.perform(post("/api/v1/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tokenRefresco\":\"" + refresco + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String accesoNuevo = JsonPath.read(renovada, "$.tokenAcceso");
        mvc.perform(get("/api/v1/boletas/mias").header(HttpHeaders.AUTHORIZATION, "Bearer " + accesoNuevo))
                .andExpect(status().isOk());

        // El token de acceso no se acepta como token de refresco.
        mvc.perform(post("/api/v1/auth/refresh").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tokenRefresco\":\"" + acceso + "\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void elRegistroCreaUnClienteConLaSesionIniciadaYSuContrasenaCifrada() throws Exception {
        String sesion = mvc.perform(post("/api/v1/auth/registro").contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nombre":"Nueva","correo":"Nueva@Gmail.com","contrasena":"abcd","rol":"ROLE_ADMIN"}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.usuario.correo").value("nueva@gmail.com"))
                .andExpect(jsonPath("$.usuario.rol").value("ROLE_CLIENTE"))
                .andReturn().getResponse().getContentAsString();

        mvc.perform(get("/api/v1/boletas/mias").header(HttpHeaders.AUTHORIZATION, "Bearer " + JsonPath.read(sesion, "$.tokenAcceso")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        assertThat(jdbc.queryForObject("SELECT contrasena_hash FROM usuarios WHERE correo = 'nueva@gmail.com'", String.class))
                .startsWith("$2a$10$");
        login("nueva@gmail.com", "abcd").andExpect(status().isOk());
    }

    @Test
    void laDocumentacionEsPublicaYNoPideAlUsuarioDeLaSesionComoParametro() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.paths['/api/v1/auth/login'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/boletas/mias'].get.parameters").doesNotExist())
                .andExpect(content().string(Matchers.not(Matchers.containsString("\"solicitante\""))));
    }

    private ResultActions login(String correo, String contrasena) throws Exception {
        return mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"correo\":\"" + correo + "\",\"contrasena\":\"" + contrasena + "\"}"));
    }
}
