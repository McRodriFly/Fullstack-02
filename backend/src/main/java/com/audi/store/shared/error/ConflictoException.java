package com.audi.store.shared.error;

/**
 * Se lanza cuando la operación choca con el estado actual de los datos (correo ya registrado,
 * registro en uso por otra tabla, stock insuficiente…); el manejador global la traduce a 409.
 */
public class ConflictoException extends RuntimeException {

    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}
