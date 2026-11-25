package com.audi.store.ventas.internal.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.audi.store.catalogo.api.ProductoResumen;
import com.audi.store.shared.config.CorsConfig;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.security.JwtProperties;
import com.audi.store.shared.security.JwtService;
import com.audi.store.shared.security.SecurityConfig;
import com.audi.store.shared.security.TokenDePrueba;
import com.audi.store.shared.security.UsuarioAutenticado;
import com.audi.store.ventas.internal.domain.Boleta;
import com.audi.store.ventas.internal.domain.DetalleBoleta;
import com.audi.store.ventas.internal.domain.TipoEntrega;
import com.audi.store.ventas.internal.service.BoletaService;
import com.audi.store.ventas.internal.service.DatosCompra;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BoletaController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class BoletaControllerTest {

    private static final String RUTA = "/api/v1/boletas";
    private static final String COMPRA = """
            {"items":[{"productoId":4,"cantidad":2}],"tipoEntrega":"DESPACHO",
             "direccionEnvio":"Calle 1","ciudad":"Santiago","cuponCodigo":"F1AUDI"}""";

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JwtService jwt;
    @Autowired
    private JwtProperties propiedadesJwt;
    @MockitoBean
    private BoletaService boletaService;

    @Test
    void sinSesionResponde401() throws Exception {
        mvc.perform(get(RUTA)).andExpect(status().isUnauthorized());
        mvc.perform(get(RUTA + "/1")).andExpect(status().isUnauthorized());
        verifyNoInteractions(boletaService);
    }

    @Test
    @WithMockUser(roles = "CLIENTE")
    void elClienteNoVeLasBoletasDeLaTienda() throws Exception {
        mvc.perform(get(RUTA)).andExpect(status().isForbidden());
        mvc.perform(get(RUTA + "/1")).andExpect(status().isForbidden());
        verifyNoInteractions(boletaService);
    }

    @Test
    @WithMockUser(roles = "VENDEDOR")
    void elVendedorListaLasBoletasConElNombreDeCadaProducto() throws Exception {
        Boleta boleta = boleta();
        when(boletaService.listar()).thenReturn(List.of(boleta));
        when(boletaService.productosDe(any())).thenReturn(Map.of(4L, resumenGorra()));

        mvc.perform(get(RUTA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].total").value(57600))
                .andExpect(jsonPath("$[0].detalles[0].productoNombre").value("Gorra Edición Especial"))
                .andExpect(jsonPath("$[0].detalles[0].precioUnitario").value(32000))
                .andExpect(jsonPath("$[0].detalles[0].subtotal").value(64000));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void elAdministradorVeElDetalleDeUnaBoleta() throws Exception {
        Boleta boleta = boleta();
        when(boletaService.obtener(10L)).thenReturn(boleta);
        when(boletaService.productosDe(any())).thenReturn(Map.of(4L, resumenGorra()));

        mvc.perform(get(RUTA + "/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cuponCodigo").value("F1AUDI"))
                .andExpect(jsonPath("$.tipoEntrega").value("DESPACHO"))
                .andExpect(jsonPath("$.estado").value("PAGADA"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void siElProductoYaNoExisteElDetalleConservaSuIdYSuPrecio() throws Exception {
        when(boletaService.obtener(10L)).thenReturn(boleta());
        when(boletaService.productosDe(any())).thenReturn(Map.of());

        mvc.perform(get(RUTA + "/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detalles[0].productoId").value(4))
                .andExpect(jsonPath("$.detalles[0].productoNombre").doesNotExist())
                .andExpect(jsonPath("$.detalles[0].precioUnitario").value(32000));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unaBoletaInexistenteResponde404() throws Exception {
        when(boletaService.obtener(99L)).thenThrow(new RecursoNoEncontradoException("La boleta 99 no existe"));

        mvc.perform(get(RUTA + "/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.mensaje").value("La boleta 99 no existe"));
    }

    @Test
    void elClienteCompraConElIdQueTraeSuToken() throws Exception {
        when(boletaService.crear(eq(3L), any())).thenReturn(boleta());
        when(boletaService.productosDe(any())).thenReturn(Map.of(4L, resumenGorra()));

        mvc.perform(post(RUTA).with(TokenDePrueba.cliente(jwt)).contentType(MediaType.APPLICATION_JSON).content(COMPRA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.total").value(57600))
                .andExpect(jsonPath("$.detalles[0].productoNombre").value("Gorra Edición Especial"));

        ArgumentCaptor<DatosCompra> compra = ArgumentCaptor.forClass(DatosCompra.class);
        verify(boletaService).crear(eq(3L), compra.capture());
        assertThat(compra.getValue().items()).containsExactly(new DatosCompra.Item(4L, 2));
        assertThat(compra.getValue().tipoEntrega()).isEqualTo(TipoEntrega.DESPACHO);
        assertThat(compra.getValue().cuponCodigo()).isEqualTo("F1AUDI");
    }

    @Test
    void elAdministradorTambienPuedeComprar() throws Exception {
        when(boletaService.crear(eq(1L), any())).thenReturn(boleta());

        mvc.perform(post(RUTA).with(TokenDePrueba.admin(jwt)).contentType(MediaType.APPLICATION_JSON).content(COMPRA))
                .andExpect(status().isCreated());
    }

    @Test
    void elVendedorNoCompraNiTieneComprasPropias() throws Exception {
        mvc.perform(post(RUTA).with(TokenDePrueba.vendedor(jwt)).contentType(MediaType.APPLICATION_JSON).content(COMPRA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.mensaje").value("No tienes permiso para realizar esta acción"));
        mvc.perform(get(RUTA + "/mias").with(TokenDePrueba.vendedor(jwt))).andExpect(status().isForbidden());
        verifyNoInteractions(boletaService);
    }

    @Test
    void sinSesionNoSeCompraYElErrorTieneElFormatoComun() throws Exception {
        mvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON).content(COMPRA))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.estado").value(401))
                .andExpect(jsonPath("$.mensaje").value("Debes iniciar sesión"))
                .andExpect(jsonPath("$.ruta").value(RUTA));
        verifyNoInteractions(boletaService);
    }

    @Test
    void unTokenVencidoAlteradoODeRefrescoResponde401ConElMotivo() throws Exception {
        mvc.perform(get(RUTA + "/mias").with(TokenDePrueba.clienteVencido(propiedadesJwt)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("Tu sesión expiró; vuelve a iniciar sesión"));
        mvc.perform(get(RUTA + "/mias").with(TokenDePrueba.bearer("no.es.un-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.mensaje").value("El token de sesión no es válido"));
        // El de refresco no abre sesión: solo se canjea en /auth/refresh.
        String refresco = jwt.emitir(new UsuarioAutenticado(3L, "cliente@gmail.com", "ROLE_CLIENTE")).refresco();
        mvc.perform(get(RUTA + "/mias").with(TokenDePrueba.bearer(refresco)))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(boletaService);
    }

    @Test
    void unCarritoInvalidoResponde400SinLlegarAlServicio() throws Exception {
        String invalido = """
                {"items":[{"productoId":4,"cantidad":0},{"cantidad":1}],"tipoEntrega":null}""";
        String vacio = """
                {"items":[],"tipoEntrega":"RETIRO"}""";

        mvc.perform(post(RUTA).with(TokenDePrueba.cliente(jwt)).contentType(MediaType.APPLICATION_JSON).content(invalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detalles[?(@ =~ /items.0..cantidad:.*/)]").exists())
                .andExpect(jsonPath("$.detalles[?(@ =~ /items.1..productoId:.*/)]").exists())
                .andExpect(jsonPath("$.detalles[?(@ =~ /tipoEntrega:.*/)]").exists());
        mvc.perform(post(RUTA).with(TokenDePrueba.cliente(jwt)).contentType(MediaType.APPLICATION_JSON).content(vacio))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(boletaService);
    }

    @Test
    void misBoletasSonLasDelUsuarioDelToken() throws Exception {
        when(boletaService.listarDe(3L)).thenReturn(List.of(boleta()));
        when(boletaService.productosDe(any())).thenReturn(Map.of(4L, resumenGorra()));

        mvc.perform(get(RUTA + "/mias").with(TokenDePrueba.cliente(jwt)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].usuarioId").value(3))
                .andExpect(jsonPath("$[0].detalles[0].cantidad").value(2));
        verify(boletaService).listarDe(3L);
    }

    @Test
    void conUnTokenRealElVendedorVeTodasLasBoletasYElClienteNo() throws Exception {
        when(boletaService.listar()).thenReturn(List.of(boleta()));

        mvc.perform(get(RUTA).with(TokenDePrueba.vendedor(jwt))).andExpect(status().isOk());
        mvc.perform(get(RUTA).with(TokenDePrueba.cliente(jwt))).andExpect(status().isForbidden());
    }

    private static ProductoResumen resumenGorra() {
        return new ProductoResumen(4L, "Gorra Edición Especial", new BigDecimal("32000"), 6);
    }

    private static Boleta boleta() {
        DetalleBoleta detalle = new DetalleBoleta();
        detalle.setProductoId(4L);
        detalle.setCantidad(2);
        detalle.setPrecioUnitario(new BigDecimal("32000"));

        Boleta b = new Boleta();
        b.setId(10L);
        b.setUsuarioId(3L);
        b.setFecha(LocalDateTime.of(2026, 11, 24, 12, 0));
        b.setSubtotal(new BigDecimal("64000"));
        b.setDescuento(new BigDecimal("6400"));
        b.setTotal(new BigDecimal("57600"));
        b.setCuponCodigo("F1AUDI");
        b.setTipoEntrega(TipoEntrega.DESPACHO);
        b.setDireccionEnvio("Calle 1");
        b.setCiudad("Santiago");
        b.agregarDetalle(detalle);
        return b;
    }
}
