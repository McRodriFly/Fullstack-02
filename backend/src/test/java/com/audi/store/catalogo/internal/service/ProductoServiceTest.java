package com.audi.store.catalogo.internal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.audi.store.catalogo.internal.domain.Categoria;
import com.audi.store.catalogo.internal.domain.Producto;
import com.audi.store.catalogo.internal.repository.ProductoRepository;
import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import java.math.BigDecimal;
import java.util.List;
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

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepository;
    @Mock
    private CategoriaService categoriaService;
    @InjectMocks
    private ProductoService productoService;

    private Categoria gorras;

    @BeforeEach
    void configurar() {
        gorras = new Categoria();
        gorras.setId(3L);
        gorras.setNombre("Gorras");
        when(categoriaService.obtener(3L)).thenReturn(gorras);
        when(productoRepository.save(any(Producto.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void creaUnProductoConSuCategoriaYSinEspaciosSobrantes() {
        Producto creado = productoService.crear(datos(" Gorra Roja ", "30000", "25000", 4));

        assertThat(creado.getNombre()).isEqualTo("Gorra Roja");
        assertThat(creado.getCategoria()).isSameAs(gorras);
        assertThat(creado.precioVigente()).isEqualByComparingTo("25000");
        assertThat(creado.getStock()).isEqualTo(4);
    }

    @Test
    void unProductoSinOfertaSeCobraAPrecioNormal() {
        Producto creado = productoService.crear(datos("Gorra", "30000", null, 4));

        assertThat(creado.estaEnOferta()).isFalse();
        assertThat(creado.precioVigente()).isEqualByComparingTo("30000");
    }

    @Test
    void rechazaPrecioNegativoOfertaNoMenorAlPrecioYStockNegativo() {
        assertThatThrownBy(() -> productoService.crear(datos("x", "-1", null, 1)))
                .isInstanceOf(SolicitudInvalidaException.class);
        assertThatThrownBy(() -> productoService.crear(datos("x", "100", "100", 1)))
                .isInstanceOf(SolicitudInvalidaException.class);
        assertThatThrownBy(() -> productoService.crear(datos("x", "100", "150", 1)))
                .isInstanceOf(SolicitudInvalidaException.class);
        assertThatThrownBy(() -> productoService.crear(datos("x", "100", null, -1)))
                .isInstanceOf(SolicitudInvalidaException.class);
        verify(productoRepository, never()).save(any());
    }

    @Test
    void unaCategoriaInexistenteSePropagaComo404() {
        when(categoriaService.obtener(99L)).thenThrow(new RecursoNoEncontradoException("La categoría 99 no existe"));
        DatosProducto datos = new DatosProducto("x", 99L, new BigDecimal("100"), null, "x.jpeg", 1);

        assertThatThrownBy(() -> productoService.crear(datos)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void actualizarReemplazaTodosLosDatos() {
        Producto existente = new Producto();
        existente.setId(7L);
        existente.setNombre("Antiguo");
        existente.setPrecio(new BigDecimal("10000"));
        existente.setPrecioOferta(new BigDecimal("8000"));
        when(productoRepository.findById(7L)).thenReturn(Optional.of(existente));

        Producto actualizado = productoService.actualizar(7L, datos("Nuevo", "20000", null, 9));

        assertThat(actualizado).isSameAs(existente);
        assertThat(actualizado.getNombre()).isEqualTo("Nuevo");
        assertThat(actualizado.getPrecio()).isEqualByComparingTo("20000");
        assertThat(actualizado.getPrecioOferta()).isNull();
        assertThat(actualizado.getStock()).isEqualTo(9);
    }

    @Test
    void obtenerUnProductoInexistenteLanza404() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productoService.obtener(99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void eliminarUnProductoYaVendidoLanzaConflicto() {
        Producto vendido = new Producto();
        vendido.setId(4L);
        when(productoRepository.findById(4L)).thenReturn(Optional.of(vendido));
        doThrow(new DataIntegrityViolationException("fk_detalles_producto")).when(productoRepository).flush();

        assertThatThrownBy(() -> productoService.eliminar(4L))
                .isInstanceOf(ConflictoException.class)
                .hasMessageContaining("ya se vendió");
    }

    @Test
    void eliminarUnProductoSinVentasLoBorra() {
        Producto libre = new Producto();
        libre.setId(5L);
        when(productoRepository.findById(5L)).thenReturn(Optional.of(libre));

        productoService.eliminar(5L);

        verify(productoRepository).delete(libre);
    }

    @Test
    void listarFiltraPorCategoriaSoloSiSeIndica() {
        when(productoRepository.findAllByOrderByIdAsc()).thenReturn(List.of(new Producto(), new Producto()));
        when(productoRepository.findByCategoriaIdOrderByIdAsc(3L)).thenReturn(List.of(new Producto()));

        assertThat(productoService.listar(null)).hasSize(2);
        assertThat(productoService.listar(3L)).hasSize(1);
    }

    private static DatosProducto datos(String nombre, String precio, String oferta, int stock) {
        return new DatosProducto(nombre, 3L, new BigDecimal(precio),
                oferta == null ? null : new BigDecimal(oferta), " x.jpeg ", stock);
    }
}
