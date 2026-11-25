package com.audi.store.catalogo.internal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.audi.store.catalogo.api.ProductoResumen;
import com.audi.store.catalogo.api.StockInsuficienteException;
import com.audi.store.catalogo.internal.domain.Producto;
import com.audi.store.catalogo.internal.repository.ProductoRepository;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CatalogoApiServiceTest {

    @Mock
    private ProductoRepository productoRepository;
    @InjectMocks
    private CatalogoApiService catalogoApi;

    @Test
    void descontarStockRestaLasUnidadesYDevuelveElPrecioVigente() {
        Producto gorra = producto(4L, 8, "40000", "32000");
        when(productoRepository.buscarParaActualizarStock(4L)).thenReturn(Optional.of(gorra));

        ProductoResumen resumen = catalogoApi.descontarStock(4L, 3);

        assertThat(gorra.getStock()).isEqualTo(5);
        assertThat(resumen.stock()).isEqualTo(5);
        assertThat(resumen.precioVigente()).isEqualByComparingTo("32000");
    }

    @Test
    void sePuedeComprarTodoElStock() {
        Producto gorra = producto(4L, 8, "40000", null);
        when(productoRepository.buscarParaActualizarStock(4L)).thenReturn(Optional.of(gorra));

        catalogoApi.descontarStock(4L, 8);

        assertThat(gorra.getStock()).isZero();
    }

    @Test
    void sinStockSuficienteLanzaConflictoYNoModificaElStock() {
        Producto gorra = producto(4L, 2, "40000", null);
        when(productoRepository.buscarParaActualizarStock(4L)).thenReturn(Optional.of(gorra));

        assertThatThrownBy(() -> catalogoApi.descontarStock(4L, 3))
                .isInstanceOf(StockInsuficienteException.class)
                .hasMessageContaining("pedido 3, disponible 2");
        assertThat(gorra.getStock()).isEqualTo(2);
    }

    @Test
    void rechazaCantidadesNoPositivasSinConsultarLaBase() {
        assertThatThrownBy(() -> catalogoApi.descontarStock(4L, 0)).isInstanceOf(SolicitudInvalidaException.class);
        assertThatThrownBy(() -> catalogoApi.descontarStock(4L, -1)).isInstanceOf(SolicitudInvalidaException.class);
        verifyNoInteractions(productoRepository);
    }

    @Test
    void unProductoInexistenteLanza404() {
        when(productoRepository.buscarParaActualizarStock(99L)).thenReturn(Optional.empty());
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> catalogoApi.descontarStock(99L, 1)).isInstanceOf(RecursoNoEncontradoException.class);
        assertThatThrownBy(() -> catalogoApi.obtenerProducto(99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void obtenerProductoEntregaElPrecioDeOfertaSiExiste() {
        when(productoRepository.findById(4L)).thenReturn(Optional.of(producto(4L, 8, "40000", "32000")));
        when(productoRepository.findById(3L)).thenReturn(Optional.of(producto(3L, 25, "35000", null)));

        assertThat(catalogoApi.obtenerProducto(4L).precioVigente()).isEqualByComparingTo("32000");
        assertThat(catalogoApi.obtenerProducto(3L).precioVigente()).isEqualByComparingTo("35000");
    }

    @Test
    void obtenerProductosOmiteLosIdsInexistentes() {
        when(productoRepository.findAllById(List.of(3L, 99L))).thenReturn(List.of(producto(3L, 25, "35000", null)));

        assertThat(catalogoApi.obtenerProductos(List.of(3L, 99L))).extracting(ProductoResumen::id).containsExactly(3L);
    }

    private static Producto producto(Long id, int stock, String precio, String oferta) {
        Producto p = new Producto();
        p.setId(id);
        p.setNombre("Producto " + id);
        p.setStock(stock);
        p.setPrecio(new BigDecimal(precio));
        p.setPrecioOferta(oferta == null ? null : new BigDecimal(oferta));
        return p;
    }
}
