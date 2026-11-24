package com.audi.store.catalogo.api;

/** Se lanza cuando se pide más unidades de las que hay en stock; se traduce a 409. */
public class StockInsuficienteException extends RuntimeException {

    public StockInsuficienteException(Long productoId, int pedido, int disponible) {
        super("Stock insuficiente para el producto " + productoId
                + ": pedido " + pedido + ", disponible " + disponible);
    }
}
