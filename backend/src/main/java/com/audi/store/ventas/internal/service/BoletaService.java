package com.audi.store.ventas.internal.service;

import com.audi.store.catalogo.api.CatalogoApi;
import com.audi.store.catalogo.api.ProductoResumen;
import com.audi.store.catalogo.api.StockInsuficienteException;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import com.audi.store.usuarios.api.UsuariosApi;
import com.audi.store.ventas.internal.domain.Boleta;
import com.audi.store.ventas.internal.domain.Cupon;
import com.audi.store.ventas.internal.domain.DetalleBoleta;
import com.audi.store.ventas.internal.domain.TipoEntrega;
import com.audi.store.ventas.internal.repository.BoletaRepository;
import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoletaService {

    private final BoletaRepository boletaRepository;
    private final CatalogoApi catalogoApi;
    private final UsuariosApi usuariosApi;

    /**
     * Registra la compra de un cliente con sesión iniciada.
     *
     * <ol>
     *   <li>Valida carrito, forma de entrega y cupón antes de tocar el stock.</li>
     *   <li>Agrupa los ítems repetidos y descuenta el stock de cada producto en orden
     *       ascendente de id (así dos compras simultáneas nunca se bloquean entre sí).</li>
     *   <li>Cobra el precio vigente que entrega el catálogo, nunca un precio enviado por el
     *       cliente, y lo guarda en cada detalle.</li>
     *   <li>Calcula subtotal, descuento del cupón y total.</li>
     * </ol>
     *
     * Todo ocurre en una sola transacción: si algo falla, el stock descontado se restituye.
     *
     * @param usuarioId id del cliente autenticado
     * @throws SolicitudInvalidaException   si el carrito está vacío, una cantidad no es positiva,
     *                                      falta la dirección de despacho o el cupón no existe
     * @throws RecursoNoEncontradoException si el usuario o algún producto no existe
     * @throws StockInsuficienteException   si algún producto no tiene stock suficiente
     */
    @Transactional
    public Boleta crear(Long usuarioId, DatosCompra datos) {
        SortedMap<Long, Integer> cantidades = agruparItems(datos.items());
        Cupon cupon = resolverCupon(datos.cuponCodigo());
        usuariosApi.obtenerUsuario(usuarioId);

        Boleta boleta = new Boleta();
        boleta.setUsuarioId(usuarioId);
        aplicarEntrega(boleta, datos);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (Map.Entry<Long, Integer> linea : cantidades.entrySet()) {
            ProductoResumen producto = catalogoApi.descontarStock(linea.getKey(), linea.getValue());
            DetalleBoleta detalle = new DetalleBoleta();
            detalle.setProductoId(producto.id());
            detalle.setCantidad(linea.getValue());
            detalle.setPrecioUnitario(producto.precioVigente());
            boleta.agregarDetalle(detalle);
            subtotal = subtotal.add(producto.precioVigente().multiply(BigDecimal.valueOf(linea.getValue())));
        }

        BigDecimal descuento = cupon == null ? BigDecimal.ZERO : cupon.descuentoSobre(subtotal);
        boleta.setSubtotal(subtotal);
        boleta.setDescuento(descuento);
        boleta.setTotal(subtotal.subtract(descuento));
        boleta.setCuponCodigo(cupon == null ? null : cupon.name());
        return boletaRepository.save(boleta);
    }

    /** Todas las boletas, de la más reciente a la más antigua (vista de administración y ventas). */
    public List<Boleta> listar() {
        return boletaRepository.findAllByOrderByFechaDesc();
    }

    /** Boletas del cliente autenticado, de la más reciente a la más antigua. */
    public List<Boleta> listarDe(Long usuarioId) {
        return boletaRepository.findByUsuarioIdOrderByFechaDesc(usuarioId);
    }

    /** @throws RecursoNoEncontradoException si la boleta no existe */
    public Boleta obtener(Long id) {
        return boletaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("La boleta " + id + " no existe"));
    }

    /**
     * Datos de los productos que aparecen en las boletas, indexados por id, para mostrar el nombre
     * en cada detalle. Se piden en una sola consulta al catálogo.
     */
    public Map<Long, ProductoResumen> productosDe(Collection<Boleta> boletas) {
        List<Long> ids = boletas.stream()
                .flatMap(b -> b.getDetalles().stream())
                .map(DetalleBoleta::getProductoId)
                .distinct()
                .toList();
        return catalogoApi.obtenerProductos(ids).stream()
                .collect(Collectors.toMap(ProductoResumen::id, Function.identity()));
    }

    // TreeMap: además de sumar repetidos, deja los ids en orden ascendente para el bloqueo.
    private static SortedMap<Long, Integer> agruparItems(List<DatosCompra.Item> items) {
        if (items == null || items.isEmpty()) {
            throw new SolicitudInvalidaException("El carrito está vacío");
        }
        SortedMap<Long, Integer> cantidades = new TreeMap<>();
        for (DatosCompra.Item item : items) {
            if (item.productoId() == null || item.cantidad() <= 0) {
                throw new SolicitudInvalidaException("Cada ítem necesita un producto y una cantidad mayor que cero");
            }
            cantidades.merge(item.productoId(), item.cantidad(), Integer::sum);
        }
        return cantidades;
    }

    private static Cupon resolverCupon(String codigo) {
        if (codigo == null || codigo.isBlank()) {
            return null;
        }
        return Cupon.buscar(codigo)
                .orElseThrow(() -> new SolicitudInvalidaException("El cupón " + codigo.trim() + " no es válido"));
    }

    private static void aplicarEntrega(Boleta boleta, DatosCompra datos) {
        if (datos.tipoEntrega() == null) {
            throw new SolicitudInvalidaException("Indica si la compra es con despacho o retiro en tienda");
        }
        boleta.setTipoEntrega(datos.tipoEntrega());
        if (datos.tipoEntrega() == TipoEntrega.RETIRO) {
            // El retiro no usa dirección; se descarta aunque el formulario la haya enviado.
            boleta.setDireccionEnvio(null);
            boleta.setCiudad(null);
            return;
        }
        if (esVacio(datos.direccionEnvio()) || esVacio(datos.ciudad())) {
            throw new SolicitudInvalidaException("El despacho requiere dirección y ciudad");
        }
        boleta.setDireccionEnvio(datos.direccionEnvio().trim());
        boleta.setCiudad(datos.ciudad().trim());
    }

    private static boolean esVacio(String texto) {
        return texto == null || texto.isBlank();
    }
}
