package com.audi.store.ventas.internal.repository;

import com.audi.store.ventas.internal.domain.Boleta;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

// Las lecturas traen el detalle en la misma consulta: open-in-view está desactivado y la
// respuesta REST lo necesita fuera de la transacción.
public interface BoletaRepository extends JpaRepository<Boleta, Long> {

    @Override
    @EntityGraph(attributePaths = "detalles")
    Optional<Boleta> findById(Long id);

    @EntityGraph(attributePaths = "detalles")
    List<Boleta> findAllByOrderByFechaDesc();

    /** Boletas de un cliente, de la más reciente a la más antigua. */
    @EntityGraph(attributePaths = "detalles")
    List<Boleta> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
