package com.audi.store.ventas.internal.web.dto;

import com.audi.store.ventas.internal.domain.DetalleBoleta;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * Línea de una boleta.
 *
 * @param productoNombre nombre actual del producto; {@code null} si el catálogo ya no lo tiene
 * @param precioUnitario precio cobrado en la compra, no el actual
 */
@Schema(description = "Línea de una boleta: un producto con su cantidad y el precio cobrado.")
public record DetalleBoletaResponse(
        @Schema(description = "Id del producto comprado.", example = "4") Long productoId,
        @Schema(description = "Nombre actual del producto; null si el catálogo ya no lo tiene.",
                example = "Gorra Edición Especial", nullable = true) String productoNombre,
        @Schema(description = "Unidades compradas.", example = "2") int cantidad,
        @Schema(description = "Precio por unidad cobrado en la compra (no el actual), en pesos.", example = "35000")
        BigDecimal precioUnitario,
        @Schema(description = "Precio unitario por cantidad, en pesos.", example = "70000") BigDecimal subtotal) {

    public static DetalleBoletaResponse desde(DetalleBoleta d, String productoNombre) {
        return new DetalleBoletaResponse(
                d.getProductoId(),
                productoNombre,
                d.getCantidad(),
                d.getPrecioUnitario(),
                d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())));
    }
}
