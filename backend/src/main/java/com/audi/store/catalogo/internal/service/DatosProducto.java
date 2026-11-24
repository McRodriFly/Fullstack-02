package com.audi.store.catalogo.internal.service;

import java.math.BigDecimal;

/**
 * Datos para crear o reemplazar un producto.
 *
 * @param precioOferta {@code null} si el producto no está en oferta
 */
public record DatosProducto(
        String nombre,
        Long categoriaId,
        BigDecimal precio,
        BigDecimal precioOferta,
        String imagen,
        int stock) {
}
