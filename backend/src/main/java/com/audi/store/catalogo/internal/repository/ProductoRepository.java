package com.audi.store.catalogo.internal.repository;

import com.audi.store.catalogo.internal.domain.Producto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByCategoriaId(Long categoriaId);
}
