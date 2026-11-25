package com.audi.store;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.audi.store.catalogo.api.CatalogoApi;
import com.audi.store.catalogo.internal.service.DatosProducto;
import com.audi.store.catalogo.internal.service.ProductoService;
import com.audi.store.shared.error.ConflictoException;
import com.audi.store.usuarios.internal.domain.Rol;
import com.audi.store.usuarios.internal.service.DatosUsuario;
import com.audi.store.usuarios.internal.service.UsuarioService;
import com.audi.store.ventas.internal.domain.Boleta;
import com.audi.store.ventas.internal.domain.TipoEntrega;
import com.audi.store.ventas.internal.service.BoletaService;
import com.audi.store.ventas.internal.service.DatosCompra;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.IllegalTransactionStateException;

/**
 * El checkout completo contra MySQL: transacciones, bloqueo de filas, restricciones de la base de
 * datos y lectura de las boletas por HTTP.
 *
 * <p>Datos iniciales usados: cliente id 3; producto 4 (Gorra Edición Especial, 40.000, oferta
 * 32.000, stock 8) y producto 9 (Polera Tipo 1 - C, 45.000, stock 5).
 */
class CheckoutIntegracionTest extends IntegracionBase {

    private static final Long CLIENTE = 3L;

    @Autowired
    private BoletaService boletaService;
    @Autowired
    private ProductoService productoService;
    @Autowired
    private UsuarioService usuarioService;
    @Autowired
    private CatalogoApi catalogoApi;
    @Autowired
    private JdbcTemplate jdbc;
    @Autowired
    private MockMvc mvc;

    private final Map<Long, Integer> stockInicial = new HashMap<>();
    private BigDecimal ofertaInicialProducto4;

    @BeforeEach
    void recordarEstado() {
        ofertaInicialProducto4 = jdbc.queryForObject("SELECT precio_oferta FROM productos WHERE id = 4", BigDecimal.class);
        jdbc.query("SELECT id, stock FROM productos", rs -> {
            stockInicial.put(rs.getLong("id"), rs.getInt("stock"));
        });
    }

    @AfterEach
    void restaurar() {
        jdbc.update("DELETE FROM boletas");
        jdbc.update("UPDATE productos SET precio_oferta = ? WHERE id = 4", ofertaInicialProducto4);
        stockInicial.forEach((id, stock) -> jdbc.update("UPDATE productos SET stock = ? WHERE id = ?", stock, id));
    }

    @Test
    void laCompraGuardaElPrecioDeOfertaDescuentaElStockYLaVenElVendedor() throws Exception {
        Boleta boleta = boletaService.crear(CLIENTE, new DatosCompra(
                List.of(new DatosCompra.Item(4L, 2)), TipoEntrega.DESPACHO, "Av. Siempre Viva 742", "Santiago", "f1audi"));

        assertThat(stock(4L)).isEqualTo(6);
        assertThat(boleta.getSubtotal()).isEqualByComparingTo("64000");
        assertThat(boleta.getDescuento()).isEqualByComparingTo("6400");
        assertThat(boleta.getTotal()).isEqualByComparingTo("57600");

        // Un reajuste posterior del producto no cambia lo cobrado en la boleta ya emitida.
        jdbc.update("UPDATE productos SET precio_oferta = 20000 WHERE id = 4");

        mvc.perform(get("/api/v1/boletas/" + boleta.getId()).with(user("vendedor").roles("VENDEDOR")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.usuarioId").value(CLIENTE))
                .andExpect(jsonPath("$.cuponCodigo").value("F1AUDI"))
                .andExpect(jsonPath("$.total").value(57600))
                .andExpect(jsonPath("$.detalles[0].productoNombre").value("Gorra Edición Especial"))
                .andExpect(jsonPath("$.detalles[0].precioUnitario").value(32000))
                .andExpect(jsonPath("$.detalles[0].cantidad").value(2));
        mvc.perform(get("/api/v1/boletas").with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
        mvc.perform(get("/api/v1/boletas").with(user("cliente").roles("CLIENTE")))
                .andExpect(status().isForbidden());
    }

    @Test
    void unItemSinStockRevierteTambienLoYaDescontadoDeLosDemas() {
        // El producto 4 se descuenta primero (orden ascendente de id) y luego falla el 9.
        DatosCompra compra = new DatosCompra(
                List.of(new DatosCompra.Item(9L, 50), new DatosCompra.Item(4L, 1)), TipoEntrega.RETIRO, null, null, null);

        assertThatThrownBy(() -> boletaService.crear(CLIENTE, compra)).isInstanceOf(ConflictoException.class);

        assertThat(stock(4L)).isEqualTo(8);
        assertThat(stock(9L)).isEqualTo(5);
        assertThat(contar("SELECT COUNT(*) FROM boletas")).isZero();
    }

    @Test
    void dosComprasSimultaneasNoVendenMasDeLoQueHay() throws Exception {
        // El producto 9 tiene 5 unidades; dos clientes piden 3 a la vez: solo uno puede comprar.
        ExecutorService hilos = Executors.newFixedThreadPool(2);
        CountDownLatch largada = new CountDownLatch(1);
        List<String> resultados = Collections.synchronizedList(new ArrayList<>());
        for (int i = 0; i < 2; i++) {
            hilos.submit(() -> {
                largada.await();
                try {
                    boletaService.crear(CLIENTE, new DatosCompra(
                            List.of(new DatosCompra.Item(9L, 3)), TipoEntrega.RETIRO, null, null, null));
                    resultados.add("comprado");
                } catch (ConflictoException e) {
                    resultados.add("sin stock");
                }
                return null;
            });
        }
        largada.countDown();
        hilos.shutdown();

        assertThat(hilos.awaitTermination(30, TimeUnit.SECONDS)).isTrue();
        assertThat(resultados).containsExactlyInAnyOrder("comprado", "sin stock");
        assertThat(stock(9L)).isEqualTo(2);
        assertThat(contar("SELECT COUNT(*) FROM boletas")).isEqualTo(1);
    }

    @Test
    void descontarStockExigeUnaTransaccionDelLlamador() {
        assertThatThrownBy(() -> catalogoApi.descontarStock(4L, 1)).isInstanceOf(IllegalTransactionStateException.class);

        assertThat(stock(4L)).isEqualTo(8);
    }

    @Test
    void unProductoVendidoYUnClienteConComprasNoSePuedenEliminar() {
        boletaService.crear(CLIENTE, new DatosCompra(
                List.of(new DatosCompra.Item(4L, 1)), TipoEntrega.RETIRO, null, null, null));

        assertThatThrownBy(() -> productoService.eliminar(4L)).isInstanceOf(ConflictoException.class);
        assertThatThrownBy(() -> usuarioService.eliminar(CLIENTE, 1L)).isInstanceOf(ConflictoException.class);
        assertThat(contar("SELECT COUNT(*) FROM productos WHERE id = 4")).isEqualTo(1);
        assertThat(contar("SELECT COUNT(*) FROM usuarios WHERE id = 3")).isEqualTo(1);
    }

    @Test
    void unProductoSinVentasSiSePuedeEliminar() {
        var creado = productoService.crear(
                new DatosProducto("Producto efímero", 3L, new BigDecimal("1000"), null, "e.jpeg", 1));

        productoService.eliminar(creado.getId());

        assertThat(contar("SELECT COUNT(*) FROM productos WHERE nombre = 'Producto efímero'")).isZero();
    }

    @Test
    void elCorreoSeNormalizaYNoSePuedeRepetirConOtraCapitalizacion() {
        assertThatThrownBy(() -> usuarioService.crear(
                new DatosUsuario("Otro", "  ADMIN@Duoc.cl ", "abcd", Rol.ROLE_CLIENTE)))
                .isInstanceOf(ConflictoException.class);

        var nuevo = usuarioService.registrar("Nueva", "Nueva@Duoc.CL", "abcd");
        try {
            assertThat(nuevo.getCorreo()).isEqualTo("nueva@duoc.cl");
            assertThat(nuevo.getRol()).isEqualTo(Rol.ROLE_CLIENTE);
        } finally {
            jdbc.update("DELETE FROM usuarios WHERE id = ?", nuevo.getId());
        }
    }

    private int stock(Long productoId) {
        return jdbc.queryForObject("SELECT stock FROM productos WHERE id = ?", Integer.class, productoId);
    }

    private int contar(String sql) {
        return jdbc.queryForObject(sql, Integer.class);
    }
}
