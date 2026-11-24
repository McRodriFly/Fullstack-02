package com.audi.store.catalogo.api;

import java.math.BigDecimal;

/**
 * Datos de un producto que pueden compartirse con otros módulos.
 *
 * @param precioVigente precio que se cobra hoy: el de oferta si la tiene, el normal si no
 * @param stock         unidades disponibles
 */
public record ProductoResumen(Long id, String nombre, BigDecimal precioVigente, int stock) {
}
