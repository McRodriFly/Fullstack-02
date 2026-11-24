package com.audi.store.shared.error;

/**
 * Se lanza cuando los datos recibidos no cumplen una regla de negocio que la validación del DTO
 * no puede expresar (cupón inexistente, despacho sin dirección…); el manejador global la traduce a 400.
 */
public class SolicitudInvalidaException extends RuntimeException {

    public SolicitudInvalidaException(String mensaje) {
        super(mensaje);
    }
}
