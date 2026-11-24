package com.audi.store.catalogo.internal.service;

import com.audi.store.catalogo.internal.domain.Categoria;
import com.audi.store.catalogo.internal.repository.CategoriaRepository;
import com.audi.store.catalogo.internal.repository.ProductoRepository;
import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public List<Categoria> listar() {
        return categoriaRepository.findAllByOrderByNombreAsc();
    }

    /** @throws RecursoNoEncontradoException si la categoría no existe */
    public Categoria obtener(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("La categoría " + id + " no existe"));
    }

    /** @throws ConflictoException si ya existe una categoría con ese nombre */
    @Transactional
    public Categoria crear(String nombre) {
        String limpio = nombre.trim();
        if (categoriaRepository.existsByNombre(limpio)) {
            throw new ConflictoException("Ya existe la categoría " + limpio);
        }
        Categoria categoria = new Categoria();
        categoria.setNombre(limpio);
        return categoriaRepository.save(categoria);
    }

    /**
     * @throws RecursoNoEncontradoException si la categoría no existe
     * @throws ConflictoException           si otra categoría ya usa ese nombre
     */
    @Transactional
    public Categoria actualizar(Long id, String nombre) {
        Categoria categoria = obtener(id);
        String limpio = nombre.trim();
        if (categoriaRepository.existsByNombreAndIdNot(limpio, id)) {
            throw new ConflictoException("Ya existe la categoría " + limpio);
        }
        categoria.setNombre(limpio);
        return categoria;
    }

    /**
     * Elimina una categoría vacía.
     *
     * @throws RecursoNoEncontradoException si la categoría no existe
     * @throws ConflictoException           si todavía tiene productos asociados
     */
    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = obtener(id);
        if (productoRepository.existsByCategoriaId(id)) {
            throw new ConflictoException("La categoría " + categoria.getNombre() + " tiene productos asociados");
        }
        categoriaRepository.delete(categoria);
    }
}
