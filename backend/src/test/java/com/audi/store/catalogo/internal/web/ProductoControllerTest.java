package com.audi.store.catalogo.internal.web;

import static org.mockito.ArgumentMatchers.any;
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
import com.audi.store.catalogo.internal.domain.Producto;
import com.audi.store.catalogo.internal.service.ProductoService;
import com.audi.store.shared.config.CorsConfig;
import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import com.audi.store.shared.security.JwtProperties;
import com.audi.store.shared.security.JwtService;
import com.audi.store.shared.security.SecurityConfig;
import com.audi.store.shared.security.TokenDePrueba;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ProductoController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class ProductoControllerTest {

    private static final String RUTA = "/api/v1/productos";
    private static final String JSON_VALIDO = """
            {"nombre":"Gorra Roja","categoriaId":3,"precio":30000,"precioOferta":25000,"imagen":"roja.jpeg","stock":4}""";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JwtService jwt;
    @Autowired
    private JwtProperties propiedadesJwt;
    @MockitoBean
    private ProductoService productoService;

    @Test
    void unTokenVencidoOInvalidoNoImpideVerElCatalogo() throws Exception {
        when(productoService.listar(null)).thenReturn(List.of());

        mvc.perform(get(RUTA).with(TokenDePrueba.clienteVencido(propiedadesJwt))).andExpect(status().isOk());
        mvc.perform(get(RUTA).with(TokenDePrueba.bearer("basura"))).andExpect(status().isOk());
    }

    @Test
    void conTokenRealSoloElAdministradorModificaElCatalogo() throws Exception {
        mvc.perform(delete(RUTA + "/4").with(TokenDePrueba.vendedor(jwt))).andExpect(status().isForbidden());
        mvc.perform(delete(RUTA + "/4").with(TokenDePrueba.cliente(jwt))).andExpect(status().isForbidden());
        verifyNoInteractions(productoService);

        mvc.perform(delete(RUTA + "/4").with(TokenDePrueba.admin(jwt))).andExpect(status().isNoContent());
        verify(productoService).eliminar(4L);
    }

    @Test
    void listarEsPublicoYTraeLosDatosDeOferta() throws Exception {
        when(productoService.listar(null)).thenReturn(List.of(producto(4L, "Gorra Edición Especial", "40000", "32000")));

        mvc.perform(get(RUTA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Gorra Edición Especial"))
                .andExpect(jsonPath("$[0].categoria").value("Gorras"))
                .andExpect(jsonPath("$[0].oferta").value(true))
                .andExpect(jsonPath("$[0].precioVigente").value(32000));
    }

    @Test
    void listarPuedeFiltrarPorCategoria() throws Exception {
        when(productoService.listar(3L)).thenReturn(List.of());

        mvc.perform(get(RUTA).param("categoriaId", "3")).andExpect(status().isOk());

        verify(productoService).listar(3L);
    }

    @Test
    void unProductoInexistenteResponde404ConElFormatoDeError() throws Exception {
        when(productoService.obtener(99L)).thenThrow(new RecursoNoEncontradoException("El producto 99 no existe"));

        mvc.perform(get(RUTA + "/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.estado").value(404))
                .andExpect(jsonPath("$.mensaje").value("El producto 99 no existe"))
                .andExpect(jsonPath("$.ruta").value(RUTA + "/99"));
    }

    @Test
    void unIdQueNoEsNumeroResponde400() throws Exception {
        mvc.perform(get(RUTA + "/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("El valor del parámetro 'id' no es válido"));
    }

    @Test
    void crearSinSesionResponde401() throws Exception {
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(productoService);
    }

    @Test
    @WithMockUser(roles = "VENDEDOR")
    void elVendedorNoPuedeCrearActualizarNiEliminar() throws Exception {
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isForbidden());
        mvc.perform(put(RUTA + "/4").contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isForbidden());
        mvc.perform(delete(RUTA + "/4")).andExpect(status().isForbidden());
        verifyNoInteractions(productoService);
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void elClienteNoPuedeCrear() throws Exception {
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.estado").value(403));
        verifyNoInteractions(productoService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void elAdministradorCreaUnProducto() throws Exception {
        when(productoService.crear(any())).thenReturn(producto(13L, "Gorra Roja", "30000", "25000"));

        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(13))
                .andExpect(jsonPath("$.categoriaId").value(3));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void elAdministradorActualizaUnProducto() throws Exception {
        when(productoService.actualizar(any(), any())).thenReturn(producto(4L, "Gorra Roja", "30000", null));

        mvc.perform(put(RUTA + "/4").contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.oferta").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void datosInvalidosResponden400ConElDetalleDeCadaCampo() throws Exception {
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content("{\"nombre\":\"\",\"precio\":-1}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("Hay datos inválidos en la solicitud"))
                .andExpect(jsonPath("$.detalles[?(@ =~ /nombre:.*/)]").exists())
                .andExpect(jsonPath("$.detalles[?(@ =~ /precio:.*/)]").exists())
                .andExpect(jsonPath("$.detalles[?(@ =~ /categoriaId:.*/)]").exists());
        verifyNoInteractions(productoService);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unJsonRotoResponde400() throws Exception {
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content("{roto"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.estado").value(400));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unaReglaDeNegocioIncumplidaResponde400() throws Exception {
        when(productoService.crear(any()))
                .thenThrow(new SolicitudInvalidaException("El precio de oferta debe ser menor que el precio normal"));

        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(JSON_VALIDO))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje").value("El precio de oferta debe ser menor que el precio normal"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void eliminarUnProductoVendidoResponde409() throws Exception {
        doThrow(new ConflictoException("El producto 4 ya se vendió y no se puede eliminar"))
                .when(productoService).eliminar(4L);

        mvc.perform(delete(RUTA + "/4"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.estado").value(409));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void eliminarUnProductoLibreResponde204() throws Exception {
        mvc.perform(delete(RUTA + "/5")).andExpect(status().isNoContent());

        verify(productoService).eliminar(5L);
    }

    private static Producto producto(Long id, String nombre, String precio, String oferta) {
        Categoria gorras = new Categoria();
        gorras.setId(3L);
        gorras.setNombre("Gorras");
        Producto p = new Producto();
        p.setId(id);
        p.setNombre(nombre);
        p.setCategoria(gorras);
        p.setPrecio(new BigDecimal(precio));
        p.setPrecioOferta(oferta == null ? null : new BigDecimal(oferta));
        p.setImagen("gorra.jpeg");
        p.setStock(8);
        return p;
    }
}
