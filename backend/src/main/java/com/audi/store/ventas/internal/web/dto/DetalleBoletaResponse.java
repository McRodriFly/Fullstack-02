package com.audi.store.ventas.internal.web.dto;

import com.audi.store.ventas.internal.domain.DetalleBoleta;
import java.math.BigDecimal;

/**
 * Línea de una boleta.
 *
 * @param productoNombre nombre actual del producto; {@code null} si el catálogo ya no lo tiene
 * @param precioUnitario precio cobrado en la compra, no el actual
 */
public record DetalleBoletaResponse(
        Long productoId,
        String productoNombre,
        int cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal) {

    public static DetalleBoletaResponse desde(DetalleBoleta d, String productoNombre) {
        return new DetalleBoletaResponse(
                d.getProductoId(),
                productoNombre,
                d.getCantidad(),
                d.getPrecioUnitario(),
                d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())));
    }
}
