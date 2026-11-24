package com.audi.store.catalogo.api;

import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import java.util.Collection;
import java.util.List;

/** Contrato que el módulo catálogo ofrece a los demás módulos. */
public interface CatalogoApi {

    /**
     * Busca un producto por su id.
     *
     * @throws RecursoNoEncontradoException si el producto no existe
     */
    ProductoResumen obtenerProducto(Long id);

    /**
     * Busca varios productos por id. Los ids que no existen se omiten del resultado.
     */
    List<ProductoResumen> obtenerProductos(Collection<Long> ids);

    /**
     * Descuenta stock dentro de la transacción de quien llama, de modo que un fallo posterior
     * deshaga también el descuento. Exige una transacción activa.
     *
     * <p>La fila del producto queda bloqueada hasta el fin de la transacción, por lo que dos
     * compras simultáneas del mismo producto se atienden una tras otra y nunca venden de más.
     * Quien descuente varios productos debe hacerlo en orden ascendente de id para evitar
     * bloqueos cruzados entre transacciones.
     *
     * @return el producto con el precio vigente leído bajo el bloqueo y el stock ya descontado
     * @throws RecursoNoEncontradoException si el producto no existe
     * @throws StockInsuficienteException   si la cantidad pedida supera el stock disponible
     * @throws SolicitudInvalidaException   si la cantidad no es positiva
     */
    ProductoResumen descontarStock(Long productoId, int cantidad);
}
