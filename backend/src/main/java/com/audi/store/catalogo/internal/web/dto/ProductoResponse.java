package com.audi.store.catalogo.internal.web.dto;

import com.audi.store.catalogo.internal.domain.Producto;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

/**
 * @param categoria    nombre de la categoría
 * @param precioOferta {@code null} si no está en oferta
 * @param oferta       indica si el producto está en oferta
 * @param precioVigente lo que se cobra hoy: la oferta si existe, el precio normal si no
 */
@Schema(description = "Producto del catálogo.")
public record ProductoResponse(
        @Schema(description = "Identificador del producto.", example = "4") Long id,
        @Schema(description = "Nombre del producto.", example = "Gorra Edición Especial") String nombre,
        @Schema(description = "Id de la categoría del producto.", example = "3") Long categoriaId,
        @Schema(description = "Nombre de la categoría del producto.", example = "Gorras") String categoria,
        @Schema(description = "Precio normal en pesos.", example = "35000") BigDecimal precio,
        @Schema(description = "Precio en oferta en pesos; null si el producto no está en oferta.",
                example = "32000", nullable = true) BigDecimal precioOferta,
        @Schema(description = "Indica si el producto está en oferta.", example = "true") boolean oferta,
        @Schema(description = "Lo que se cobra hoy: el precio en oferta si existe, el normal si no.", example = "32000")
        BigDecimal precioVigente,
        @Schema(description = "Nombre del archivo de la imagen.", example = "Gorra1.jpeg") String imagen,
        @Schema(description = "Unidades disponibles.", example = "8") int stock) {

    public static ProductoResponse desde(Producto p) {
        return new ProductoResponse(
                p.getId(),
                p.getNombre(),
                p.getCategoria().getId(),
                p.getCategoria().getNombre(),
                p.getPrecio(),
                p.getPrecioOferta(),
                p.estaEnOferta(),
                p.precioVigente(),
                p.getImagen(),
                p.getStock());
    }
}
