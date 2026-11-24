package com.audi.store.ventas.internal.service;

import com.audi.store.ventas.internal.domain.TipoEntrega;
import java.util.List;

/**
 * Lo que el cliente envía al pagar. No trae precios: el servicio los toma del catálogo.
 *
 * @param items        puede repetir un mismo producto; el servicio suma las cantidades
 * @param cuponCodigo  {@code null} o vacío si no se usa cupón
 */
public record DatosCompra(
        List<Item> items,
        TipoEntrega tipoEntrega,
        String direccionEnvio,
        String ciudad,
        String cuponCodigo) {

    public record Item(Long productoId, int cantidad) {
    }
}
