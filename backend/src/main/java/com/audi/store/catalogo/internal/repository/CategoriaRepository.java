package com.audi.store.catalogo.internal.repository;

import com.audi.store.catalogo.internal.domain.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    boolean existsByNombre(String nombre);
}
