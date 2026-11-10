package com.audi.productos.repository;

import com.audi.productos.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByOfertaTrue();
    List<Producto> findByCategoria(String categoria);
}
