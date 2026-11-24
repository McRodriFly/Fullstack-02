package com.audi.store.catalogo.internal.web.dto;

import com.audi.store.catalogo.internal.domain.Producto;
import java.math.BigDecimal;

/**
 * @param categoria    nombre de la categoría
 * @param precioOferta {@code null} si no está en oferta
 * @param oferta       indica si el producto está en oferta
 * @param precioVigente lo que se cobra hoy: la oferta si existe, el precio normal si no
 */
public record ProductoResponse(
        Long id,
        String nombre,
        Long categoriaId,
        String categoria,
        BigDecimal precio,
        BigDecimal precioOferta,
        boolean oferta,
        BigDecimal precioVigente,
        String imagen,
        int stock) {

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
