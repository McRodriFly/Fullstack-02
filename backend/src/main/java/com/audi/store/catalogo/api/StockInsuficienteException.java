package com.audi.store.catalogo.api;

import com.audi.store.shared.error.ConflictoException;

/** Se lanza cuando se piden más unidades de las que hay en stock; se traduce a 409. */
public class StockInsuficienteException extends ConflictoException {

    public StockInsuficienteException(Long productoId, int pedido, int disponible) {
        super("Stock insuficiente para el producto " + productoId
                + ": pedido " + pedido + ", disponible " + disponible);
    }
}
