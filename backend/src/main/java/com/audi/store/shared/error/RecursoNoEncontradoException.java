package com.audi.store.shared.error;

/** Se lanza cuando un recurso pedido por su id no existe; el manejador global la traduce a 404. */
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
