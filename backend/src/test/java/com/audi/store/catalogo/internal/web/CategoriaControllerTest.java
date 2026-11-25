package com.audi.store.catalogo.internal.web;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.audi.store.catalogo.internal.domain.Categoria;
import com.audi.store.catalogo.internal.service.CategoriaService;
import com.audi.store.shared.config.CorsConfig;
import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.security.SecurityConfig;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CategoriaController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class CategoriaControllerTest {

    private static final String RUTA = "/api/v1/categorias";

    @Autowired
    private MockMvc mvc;
    @MockitoBean
    private CategoriaService categoriaService;

    @Test
    void listarEsPublico() throws Exception {
        when(categoriaService.listar()).thenReturn(List.of(categoria(1L, "Chaquetas"), categoria(3L, "Gorras")));

        mvc.perform(get(RUTA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[1].nombre").value("Gorras"));
    }

    @Test
    void crearSinSesionResponde401() throws Exception {
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Mochilas\"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(categoriaService);
    }

    @Test
    @WithMockUser(roles = {"VENDEDOR", "CLIENTE"})
    void soloElAdministradorEscribe() throws Exception {
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Mochilas\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(put(RUTA + "/3").contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Mochilas\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(delete(RUTA + "/3")).andExpect(status().isForbidden());
        verifyNoInteractions(categoriaService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void elAdministradorCreaYRenombra() throws Exception {
        when(categoriaService.crear("Mochilas")).thenReturn(categoria(6L, "Mochilas"));
        when(categoriaService.actualizar(6L, "Bolsos")).thenReturn(categoria(6L, "Bolsos"));

        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Mochilas\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(6));
        mvc.perform(put(RUTA + "/6").contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Bolsos\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nombre").value("Bolsos"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unNombreVacioResponde400() throws Exception {
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\" \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles[0]").value(org.hamcrest.Matchers.startsWith("nombre:")));
        verifyNoInteractions(categoriaService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unNombreRepetidoResponde409() throws Exception {
        when(categoriaService.crear("Gorras")).thenThrow(new ConflictoException("Ya existe la categoría Gorras"));

        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"Gorras\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void eliminarUnaCategoriaConProductosResponde409() throws Exception {
        doThrow(new ConflictoException("La categoría Gorras tiene productos asociados"))
                .when(categoriaService).eliminar(3L);

        mvc.perform(delete(RUTA + "/3")).andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void eliminarUnaCategoriaVaciaResponde204() throws Exception {
        mvc.perform(delete(RUTA + "/9")).andExpect(status().isNoContent());

        verify(categoriaService).eliminar(9L);
    }

    private static Categoria categoria(Long id, String nombre) {
        Categoria c = new Categoria();
        c.setId(id);
        c.setNombre(nombre);
        return c;
    }
}
