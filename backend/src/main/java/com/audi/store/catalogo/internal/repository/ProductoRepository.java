package com.audi.store.catalogo.internal.repository;

import com.audi.store.catalogo.internal.domain.Producto;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

// Las consultas de lectura traen la categoría en la misma consulta: open-in-view está desactivado
// y la respuesta REST necesita su nombre fuera de la transacción.
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    @Override
    @EntityGraph(attributePaths = "categoria")
    Optional<Producto> findById(Long id);

    @EntityGraph(attributePaths = "categoria")
    List<Producto> findAllByOrderByIdAsc();

    @EntityGraph(attributePaths = "categoria")
    List<Producto> findByCategoriaIdOrderByIdAsc(Long categoriaId);

    boolean existsByCategoriaId(Long categoriaId);

    /** Lee el producto con SELECT … FOR UPDATE: la fila queda bloqueada hasta el fin de la transacción. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.id = :id")
    Optional<Producto> buscarParaActualizarStock(@Param("id") Long id);
}
