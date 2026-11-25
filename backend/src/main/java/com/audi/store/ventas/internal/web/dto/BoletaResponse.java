package com.audi.store.ventas.internal.web.dto;

import com.audi.store.catalogo.api.ProductoResumen;
import com.audi.store.ventas.internal.domain.Boleta;
import com.audi.store.ventas.internal.domain.EstadoBoleta;
import com.audi.store.ventas.internal.domain.TipoEntrega;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * @param descuento  monto descontado en pesos
 * @param cuponCodigo {@code null} si no se usó cupón
 */
@Schema(description = "Boleta de una compra. El número de pedido que ve el cliente se arma con el id (AUF1-000001).")
public record BoletaResponse(
        @Schema(description = "Identificador de la boleta.", example = "1") Long id,
        @Schema(description = "Id del usuario que compró.", example = "3") Long usuarioId,
        @Schema(description = "Fecha y hora de la compra.", example = "2026-11-25T12:55:03") LocalDateTime fecha,
        @Schema(description = "Estado de la boleta.", example = "PAGADA") EstadoBoleta estado,
        @Schema(description = "Suma de las líneas, en pesos, antes del descuento.", example = "70000") BigDecimal subtotal,
        @Schema(description = "Monto descontado por el cupón, en pesos.", example = "7000") BigDecimal descuento,
        @Schema(description = "Total cobrado, en pesos: subtotal menos descuento.", example = "63000") BigDecimal total,
        @Schema(description = "Código del cupón aplicado; null si no se usó cupón.", example = "F1AUDI", nullable = true)
        String cuponCodigo,
        @Schema(description = "Forma de entrega.", example = "DESPACHO") TipoEntrega tipoEntrega,
        @Schema(description = "Dirección de despacho; null con retiro en tienda.", example = "Av. Siempre Viva 742", nullable = true)
        String direccionEnvio,
        @Schema(description = "Ciudad de despacho; null con retiro en tienda.", example = "Santiago", nullable = true)
        String ciudad,
        @Schema(description = "Líneas de la boleta, una por producto.") List<DetalleBoletaResponse> detalles) {

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
