package com.audi.store.usuarios.internal.repository;

import com.audi.store.usuarios.internal.domain.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    List<Usuario> findAllByOrderByIdAsc();

    /** Busca por correo sin distinguir mayúsculas (lo define la colación de la columna). */
    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    /** Para actualizar: ¿otro usuario, distinto de {@code id}, ya usa ese correo? */
    boolean existsByCorreoAndIdNot(String correo, Long id);
}
