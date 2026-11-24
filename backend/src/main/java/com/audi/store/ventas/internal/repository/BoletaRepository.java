package com.audi.store.ventas.internal.repository;

import com.audi.store.ventas.internal.domain.Boleta;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoletaRepository extends JpaRepository<Boleta, Long> {

    /** Boletas de un cliente, de la más reciente a la más antigua. */
    List<Boleta> findByUsuarioIdOrderByFechaDesc(Long usuarioId);
}
