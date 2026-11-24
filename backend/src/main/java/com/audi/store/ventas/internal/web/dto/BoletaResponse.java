package com.audi.store.ventas.internal.web.dto;

import com.audi.store.catalogo.api.ProductoResumen;
import com.audi.store.ventas.internal.domain.Boleta;
import com.audi.store.ventas.internal.domain.EstadoBoleta;
import com.audi.store.ventas.internal.domain.TipoEntrega;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * @param descuento  monto descontado en pesos
 * @param cuponCodigo {@code null} si no se usó cupón
 */
public record BoletaResponse(
        Long id,
        Long usuarioId,
        LocalDateTime fecha,
        EstadoBoleta estado,
        BigDecimal subtotal,
        BigDecimal descuento,
        BigDecimal total,
        String cuponCodigo,
        TipoEntrega tipoEntrega,
        String direccionEnvio,
        String ciudad,
        List<DetalleBoletaResponse> detalles) {

    /** @param productos datos de los productos de la boleta, indexados por id, para mostrar sus nombres */
    public static BoletaResponse desde(Boleta b, Map<Long, ProductoResumen> productos) {
        List<DetalleBoletaResponse> detalles = b.getDetalles().stream()
                .map(d -> DetalleBoletaResponse.desde(d,
                        productos.containsKey(d.getProductoId()) ? productos.get(d.getProductoId()).nombre() : null))
                .toList();
        return new BoletaResponse(
                b.getId(), b.getUsuarioId(), b.getFecha(), b.getEstado(), b.getSubtotal(), b.getDescuento(),
                b.getTotal(), b.getCuponCodigo(), b.getTipoEntrega(), b.getDireccionEnvio(), b.getCiudad(), detalles);
    }
}
