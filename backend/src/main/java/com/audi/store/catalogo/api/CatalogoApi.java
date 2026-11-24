package com.audi.store.catalogo.api;

import com.audi.store.shared.error.RecursoNoEncontradoException;

/** Contrato que el módulo catálogo ofrece a los demás módulos. */
public interface CatalogoApi {

    /**
     * Busca un producto por su id.
     *
     * @throws RecursoNoEncontradoException si el producto no existe
     */
    ProductoResumen obtenerProducto(Long id);

    /**
     * Descuenta stock dentro de la transacción de quien llama, de modo que un
     * fallo posterior deshaga también el descuento.
     *
     * @throws RecursoNoEncontradoException si el producto no existe
     * @throws StockInsuficienteException   si la cantidad pedida supera el stock disponible
     */
    void descontarStock(Long productoId, int cantidad);
}
