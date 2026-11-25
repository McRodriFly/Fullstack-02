package com.audi.store.ventas.internal.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.audi.store.catalogo.api.ProductoResumen;
import com.audi.store.shared.config.CorsConfig;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.security.SecurityConfig;
import com.audi.store.ventas.internal.domain.Boleta;
import com.audi.store.ventas.internal.domain.DetalleBoleta;
import com.audi.store.ventas.internal.domain.TipoEntrega;
import com.audi.store.ventas.internal.service.BoletaService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(BoletaController.class)
@Import({SecurityConfig.class, CorsConfig.class})
class BoletaControllerTest {

    private static final String RUTA = "/api/v1/boletas";

    @Autowired
    private MockMvc mvc;
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
