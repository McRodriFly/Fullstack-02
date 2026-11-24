package com.audi.store.catalogo.internal.repository;

import com.audi.store.catalogo.internal.domain.Categoria;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findAllByOrderByNombreAsc();

    boolean existsByNombre(String nombre);

    /** Para actualizar: ¿otra categoría, distinta de {@code id}, ya usa ese nombre? */
    boolean existsByNombreAndIdNot(String nombre, Long id);
}
