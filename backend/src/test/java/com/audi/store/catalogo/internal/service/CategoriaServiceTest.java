package com.audi.store.catalogo.internal.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.audi.store.catalogo.internal.domain.Categoria;
import com.audi.store.catalogo.internal.repository.CategoriaRepository;
import com.audi.store.catalogo.internal.repository.ProductoRepository;
import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CategoriaServiceTest {

    @Mock
    private CategoriaRepository categoriaRepository;
    @Mock
    private ProductoRepository productoRepository;
    @InjectMocks
    private CategoriaService categoriaService;

    @Test
    void creaUnaCategoriaSinEspaciosSobrantes() {
        when(categoriaRepository.save(any(Categoria.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThat(categoriaService.crear("  Mochilas ").getNombre()).isEqualTo("Mochilas");
    }

    @Test
    void noCreaUnaCategoriaConNombreRepetido() {
        when(categoriaRepository.existsByNombre("Gorras")).thenReturn(true);

        assertThatThrownBy(() -> categoriaService.crear("Gorras")).isInstanceOf(ConflictoException.class);
        verify(categoriaRepository, never()).save(any());
    }

    @Test
    void renombrarPermiteConservarElPropioNombrePeroNoElDeOtra() {
        Categoria gorras = categoria(3L, "Gorras");
        when(categoriaRepository.findById(3L)).thenReturn(Optional.of(gorras));
        when(categoriaRepository.existsByNombreAndIdNot("Gorras", 3L)).thenReturn(false);
        when(categoriaRepository.existsByNombreAndIdNot("Poleras", 3L)).thenReturn(true);

        assertThat(categoriaService.actualizar(3L, "Gorras").getNombre()).isEqualTo("Gorras");
        assertThatThrownBy(() -> categoriaService.actualizar(3L, "Poleras")).isInstanceOf(ConflictoException.class);
    }

    @Test
    void noEliminaUnaCategoriaConProductos() {
        when(categoriaRepository.findById(3L)).thenReturn(Optional.of(categoria(3L, "Gorras")));
        when(productoRepository.existsByCategoriaId(3L)).thenReturn(true);

        assertThatThrownBy(() -> categoriaService.eliminar(3L))
                .isInstanceOf(ConflictoException.class)
                .hasMessageContaining("Gorras");
        verify(categoriaRepository, never()).delete(any());
    }

    @Test
    void eliminaUnaCategoriaVacia() {
        Categoria vacia = categoria(9L, "Vacía");
        when(categoriaRepository.findById(9L)).thenReturn(Optional.of(vacia));
        when(productoRepository.existsByCategoriaId(9L)).thenReturn(false);

        categoriaService.eliminar(9L);

        verify(categoriaRepository).delete(vacia);
    }

    @Test
    void unaCategoriaInexistenteLanza404() {
        when(categoriaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoriaService.obtener(99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    private static Categoria categoria(Long id, String nombre) {
        Categoria c = new Categoria();
        c.setId(id);
        c.setNombre(nombre);
        return c;
    }
}
