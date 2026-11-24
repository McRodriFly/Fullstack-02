package com.audi.store.usuarios.internal.service;

import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.domain.Usuario;
import com.audi.store.usuarios.internal.repository.UsuarioRepository;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> listar() {
        return usuarioRepository.findAllByOrderByIdAsc();
    }

    /** @throws RecursoNoEncontradoException si el usuario no existe */
    public Usuario obtener(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El usuario " + id + " no existe"));
    }

    /**
     * Registro público desde la tienda. El rol es siempre cliente: nadie puede darse a sí mismo
     * permisos de administrador o vendedor al registrarse.
     *
     * @throws ConflictoException si el correo ya está registrado
     */
    @Transactional
    public Usuario registrar(String nombre, String correo, String contrasena) {
        return crear(new DatosUsuario(nombre, correo, contrasena, Rol.ROLE_CLIENTE));
    }

    /**
     * Alta desde la administración, con cualquier rol.
     *
     * @throws ConflictoException         si el correo ya está registrado
     * @throws SolicitudInvalidaException si falta la contraseña
     */
    @Transactional
    public Usuario crear(DatosUsuario datos) {
        String correo = normalizarCorreo(datos.correo());
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new ConflictoException("El correo " + correo + " ya está registrado");
        }
        if (esVacia(datos.contrasena())) {
            throw new SolicitudInvalidaException("La contraseña es obligatoria");
        }
        Usuario usuario = new Usuario();
        usuario.setNombre(datos.nombre().trim());
        usuario.setCorreo(correo);
        usuario.setContrasenaHash(passwordEncoder.encode(datos.contrasena()));
        usuario.setRol(datos.rol());
        return usuarioRepository.save(usuario);
    }

    /**
     * Actualiza nombre, correo, rol y, si viene, la contraseña.
     *
     * <p>Un administrador no puede quitarse su propio rol: evita que el sistema quede sin nadie
     * capaz de administrarlo.
     *
     * @param idSolicitante id del usuario autenticado que hace el cambio
     * @throws RecursoNoEncontradoException si el usuario no existe
     * @throws ConflictoException           si el correo ya lo usa otro usuario o si el
     *                                      administrador intenta quitarse su propio rol
     */
    @Transactional
    public Usuario actualizar(Long id, DatosUsuario datos, Long idSolicitante) {
        Usuario usuario = obtener(id);
        String correo = normalizarCorreo(datos.correo());
        if (usuarioRepository.existsByCorreoAndIdNot(correo, id)) {
            throw new ConflictoException("El correo " + correo + " ya está registrado");
        }
        if (id.equals(idSolicitante) && datos.rol() != usuario.getRol()) {
            throw new ConflictoException("No puedes cambiar tu propio rol");
        }
        usuario.setNombre(datos.nombre().trim());
        usuario.setCorreo(correo);
        usuario.setRol(datos.rol());
        if (!esVacia(datos.contrasena())) {
            usuario.setContrasenaHash(passwordEncoder.encode(datos.contrasena()));
        }
        return usuario;
    }

    /**
     * Elimina una cuenta sin compras. Las boletas son de otro módulo, así que la comprobación la
     * hace la clave foránea {@code fk_boletas_usuario} de la base de datos.
     *
     * @param idSolicitante id del usuario autenticado que hace el cambio
     * @throws RecursoNoEncontradoException si el usuario no existe
     * @throws ConflictoException           si intenta eliminar su propia cuenta o si el usuario
     *                                      tiene compras registradas
     */
    @Transactional
    public void eliminar(Long id, Long idSolicitante) {
        if (id.equals(idSolicitante)) {
            throw new ConflictoException("No puedes eliminar tu propia cuenta");
        }
        Usuario usuario = obtener(id);
        try {
            usuarioRepository.delete(usuario);
            // flush para que la violación de la clave foránea ocurra aquí y no al confirmar.
            usuarioRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictoException("El usuario " + id + " tiene compras registradas y no se puede eliminar");
        }
    }

    // La colación ya compara sin mayúsculas; normalizar evita guardar variantes del mismo correo.
    private static String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }

    private static boolean esVacia(String texto) {
        return texto == null || texto.isBlank();
    }
}
