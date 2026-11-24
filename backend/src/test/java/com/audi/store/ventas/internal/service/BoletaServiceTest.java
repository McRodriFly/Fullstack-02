package com.audi.store.ventas.internal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.audi.store.catalogo.api.CatalogoApi;
import com.audi.store.catalogo.api.ProductoResumen;
import com.audi.store.catalogo.api.StockInsuficienteException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import com.audi.store.usuarios.api.UsuariosApi;
import com.audi.store.ventas.internal.domain.Boleta;
import com.audi.store.ventas.internal.domain.DetalleBoleta;
import com.audi.store.ventas.internal.domain.TipoEntrega;
import com.audi.store.ventas.internal.repository.BoletaRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class BoletaServiceTest {

    private static final Long CLIENTE = 3L;

    @Mock
    private BoletaRepository boletaRepository;
    @Mock
    private CatalogoApi catalogoApi;
    @Mock
    private UsuariosApi usuariosApi;
    @InjectMocks
    private BoletaService boletaService;

    @BeforeEach
    void configurar() {
        when(boletaRepository.save(any(Boleta.class))).thenAnswer(inv -> inv.getArgument(0));
        // Gorra a precio normal y polera con precio de oferta ya resuelto por el catálogo.
        when(catalogoApi.descontarStock(anyLong(), anyInt())).thenAnswer(inv -> {
            Long id = inv.getArgument(0);
            BigDecimal precio = id == 3L ? new BigDecimal("35000") : new BigDecimal("36000");
            return new ProductoResumen(id, "Producto " + id, precio, 10);
        });
    }

    @Test
    void agrupaItemsRepetidosYCobraElPrecioDelCatalogo() {
        DatosCompra datos = retiro(null, item(3L, 1), item(8L, 2), item(3L, 1));

        Boleta boleta = boletaService.crear(CLIENTE, datos);

        assertThat(boleta.getDetalles()).hasSize(2);
        DetalleBoleta gorra = detalle(boleta, 3L);
        assertThat(gorra.getCantidad()).isEqualTo(2);
        assertThat(gorra.getPrecioUnitario()).isEqualByComparingTo("35000");
        assertThat(detalle(boleta, 8L).getPrecioUnitario()).isEqualByComparingTo("36000");
        assertThat(boleta.getSubtotal()).isEqualByComparingTo("142000");
        assertThat(boleta.getDescuento()).isEqualByComparingTo("0");
        assertThat(boleta.getTotal()).isEqualByComparingTo("142000");
        assertThat(boleta.getUsuarioId()).isEqualTo(CLIENTE);
    }

    @Test
    void descuentaStockEnOrdenAscendenteDeId() {
        boletaService.crear(CLIENTE, retiro(null, item(8L, 1), item(3L, 1)));

        InOrder orden = inOrder(catalogoApi);
        orden.verify(catalogoApi).descontarStock(3L, 1);
        orden.verify(catalogoApi).descontarStock(8L, 1);
    }

    @Test
    void aplicaElCuponIgnorandoMayusculasYRedondeaAlPeso() {
        // 3 x 35000 + 1 x 36000 = 141000; 15 % = 21150.
        Boleta boleta = boletaService.crear(CLIENTE, retiro(" neuburg2026 ", item(3L, 3), item(8L, 1)));

        assertThat(boleta.getCuponCodigo()).isEqualTo("NEUBURG2026");
        assertThat(boleta.getDescuento()).isEqualByComparingTo("21150");
        assertThat(boleta.getTotal()).isEqualByComparingTo("119850");
    }

    @Test
    void redondeaElMedioPesoHaciaArriba() {
        when(catalogoApi.descontarStock(5L, 1)).thenReturn(
                new ProductoResumen(5L, "Llavero", new BigDecimal("15005"), 10));

        Boleta boleta = boletaService.crear(CLIENTE, retiro("F1AUDI", item(5L, 1)));

        // 10 % de 15005 = 1500,5 → 1501, igual que Math.round en el frontend.
        assertThat(boleta.getDescuento()).isEqualByComparingTo("1501");
        assertThat(boleta.getTotal()).isEqualByComparingTo("13504");
    }

    @Test
    void rechazaUnCuponInexistenteSinTocarElStock() {
        assertThatThrownBy(() -> boletaService.crear(CLIENTE, retiro("GRATIS", item(3L, 1))))
                .isInstanceOf(SolicitudInvalidaException.class)
                .hasMessageContaining("GRATIS");
        verify(catalogoApi, never()).descontarStock(anyLong(), anyInt());
    }

    @Test
    void rechazaUnCarritoVacio() {
        assertThatThrownBy(() -> boletaService.crear(CLIENTE, retiro(null)))
                .isInstanceOf(SolicitudInvalidaException.class);
    }

    @Test
    void rechazaCantidadesNoPositivas() {
        assertThatThrownBy(() -> boletaService.crear(CLIENTE, retiro(null, item(3L, 0))))
                .isInstanceOf(SolicitudInvalidaException.class);
    }

    @Test
    void elDespachoExigeDireccionYCiudad() {
        DatosCompra sinCiudad = new DatosCompra(List.of(item(3L, 1)), TipoEntrega.DESPACHO, "Av. Siempre Viva 742", " ", null);

        assertThatThrownBy(() -> boletaService.crear(CLIENTE, sinCiudad))
                .isInstanceOf(SolicitudInvalidaException.class);
        verify(catalogoApi, never()).descontarStock(anyLong(), anyInt());
    }

    @Test
    void elRetiroDescartaLaDireccion() {
        DatosCompra datos = new DatosCompra(List.of(item(3L, 1)), TipoEntrega.RETIRO, "Calle 1", "Santiago", null);

        Boleta boleta = boletaService.crear(CLIENTE, datos);

        assertThat(boleta.getDireccionEnvio()).isNull();
        assertThat(boleta.getCiudad()).isNull();
    }

    @Test
    void sinStockNoSeGuardaLaBoleta() {
        when(catalogoApi.descontarStock(8L, 99)).thenThrow(new StockInsuficienteException(8L, 99, 12));

        assertThatThrownBy(() -> boletaService.crear(CLIENTE, retiro(null, item(3L, 1), item(8L, 99))))
                .isInstanceOf(StockInsuficienteException.class);
        verify(boletaRepository, never()).save(any());
    }

    private static DatosCompra.Item item(Long productoId, int cantidad) {
        return new DatosCompra.Item(productoId, cantidad);
    }

    private static DatosCompra retiro(String cupon, DatosCompra.Item... items) {
        return new DatosCompra(List.of(items), TipoEntrega.RETIRO, null, null, cupon);
    }

    private static DetalleBoleta detalle(Boleta boleta, Long productoId) {
        return boleta.getDetalles().stream()
                .filter(d -> d.getProductoId().equals(productoId))
                .findFirst()
                .orElseThrow();
    }
}
