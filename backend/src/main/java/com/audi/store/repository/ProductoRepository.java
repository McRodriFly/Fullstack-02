package com.audi.store.repository;

import com.audi.store.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByOfertaTrue();
    List<Producto> findByCategoria(String categoria);
}
