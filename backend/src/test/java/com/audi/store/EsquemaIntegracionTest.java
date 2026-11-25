package com.audi.store;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.audi.store.usuarios.internal.repository.UsuarioRepository;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Verifica las migraciones: los datos iniciales y las restricciones que protege la base de datos. */
class EsquemaIntegracionTest extends IntegracionBase {

    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @AfterEach
    void limpiar() {
        jdbc.update("DELETE FROM boletas");
    }

    @Test
    void lasTresCuentasInicialesTienenLaContrasena1234CifradaConBCrypt() {
        var usuarios = usuarioRepository.findAll();

        assertThat(usuarios).extracting("correo")
                .containsExactlyInAnyOrder("admin@duoc.cl", "vendedor@duoc.cl", "cliente@gmail.com");
        assertThat(usuarios).allSatisfy(u -> {
            assertThat(u.getContrasenaHash()).startsWith("$2a$10$");
            assertThat(passwordEncoder.matches("1234", u.getContrasenaHash())).isTrue();
        });
    }

    @Test
    void elCatalogoInicialCoincideConElDelFrontendIncluidosLosIds() {
        assertThat(contar("SELECT COUNT(*) FROM categorias")).isEqualTo(5);
        assertThat(contar("SELECT COUNT(*) FROM productos")).isEqualTo(12);

        Map<String, Object> gorra = jdbc.queryForMap(
                "SELECT p.nombre, p.precio, p.precio_oferta, p.stock, c.nombre AS categoria "
                        + "FROM productos p JOIN categorias c ON c.id = p.categoria_id WHERE p.id = 4");
        // Verifica además que los acentos sobreviven a la migración (UTF-8 de punta a punta).
        assertThat(gorra.get("nombre")).isEqualTo("Gorra Edición Especial");
        assertThat(gorra.get("categoria")).isEqualTo("Gorras");
        assertThat(gorra.get("precio_oferta").toString()).isEqualTo("32000");
        assertThat(gorra.get("stock")).isEqualTo(8);
        assertThat(jdbc.queryForObject("SELECT nombre FROM productos WHERE id = 1", String.class))
                .isEqualTo("Chaqueta Oficial F1");
    }

    @Test
    void laBaseRechazaUnRolInvalido() {
        assertRechaza("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES ('x', 'x@x.cl', 'h', 'ROLE_JEFE')");
    }

    @Test
    void laBaseRechazaUnCorreoRepetidoSinImportarMayusculas() {
        assertRechaza("INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES ('x', 'ADMIN@DUOC.CL', 'h', 'ROLE_CLIENTE')");
    }

    @Test
    void laBaseRechazaStockNegativoYOfertaNoMenorAlPrecio() {
        assertRechaza("UPDATE productos SET stock = -1 WHERE id = 1");
        assertRechaza("UPDATE productos SET precio_oferta = precio WHERE id = 1");
    }

    @Test
    void laBaseRechazaUnaBoletaConTotalDescuadradoOUnDespachoSinDireccion() {
        assertRechaza("INSERT INTO boletas (usuario_id, subtotal, descuento, total, tipo_entrega, direccion_envio, ciudad) "
                + "VALUES (3, 100, 10, 100, 'DESPACHO', 'Calle 1', 'Santiago')");
        assertRechaza("INSERT INTO boletas (usuario_id, subtotal, descuento, total, tipo_entrega) "
                + "VALUES (3, 100, 0, 100, 'DESPACHO')");
    }

    @Test
    void laBaseRechazaUnaBoletaSinUsuario() {
        assertRechaza("INSERT INTO boletas (usuario_id, subtotal, descuento, total, tipo_entrega) "
                + "VALUES (NULL, 100, 0, 100, 'RETIRO')");
    }

    @Test
    void laBaseRechazaDetallesInvalidosYRepetidos() {
        jdbc.update("INSERT INTO boletas (id, usuario_id, subtotal, descuento, total, tipo_entrega) VALUES (900, 3, 100, 0, 100, 'RETIRO')");
        jdbc.update("INSERT INTO detalles_boleta (boleta_id, producto_id, cantidad, precio_unitario) VALUES (900, 1, 1, 100)");

        assertRechaza("INSERT INTO detalles_boleta (boleta_id, producto_id, cantidad, precio_unitario) VALUES (900, 1, 1, 100)");
        assertRechaza("INSERT INTO detalles_boleta (boleta_id, producto_id, cantidad, precio_unitario) VALUES (900, 2, 0, 100)");
    }

    @Test
    void borrarUnaBoletaBorraSuDetalleYUnProductoVendidoNoSePuedeBorrar() {
        jdbc.update("INSERT INTO boletas (id, usuario_id, subtotal, descuento, total, tipo_entrega) VALUES (901, 3, 100, 0, 100, 'RETIRO')");
        jdbc.update("INSERT INTO detalles_boleta (boleta_id, producto_id, cantidad, precio_unitario) VALUES (901, 1, 1, 100)");

        assertRechaza("DELETE FROM productos WHERE id = 1");
        assertRechaza("DELETE FROM usuarios WHERE id = 3");

        jdbc.update("DELETE FROM boletas WHERE id = 901");
        assertThat(contar("SELECT COUNT(*) FROM detalles_boleta WHERE boleta_id = 901")).isZero();
    }

    // Una restricción UNIQUE o FOREIGN KEY llega como DataIntegrityViolationException; una CHECK de
    // MySQL (error 3819) llega como UncategorizedSQLException. Ambas son DataAccessException.
    private void assertRechaza(String sql) {
        assertThatThrownBy(() -> jdbc.update(sql)).as(sql).isInstanceOf(DataAccessException.class);
    }

    private int contar(String sql) {
        return jdbc.queryForObject(sql, Integer.class);
    }
}
