package com.audi.store.shared.error;

import org.springframework.security.core.AuthenticationException;

/**
 * La solicitud no se pudo autenticar: credenciales incorrectas o token vencido, alterado o de
 * otro tipo. El manejador global la traduce a 401 con este mensaje, pensado para el usuario.
 *
 * <p>Extiende {@link AuthenticationException} para que Spring Security también la reconozca como
 * un fallo de autenticación.
 */
public class NoAutenticadoException extends AuthenticationException {

    public NoAutenticadoException(String mensaje) {
        super(mensaje);
    }

    public NoAutenticadoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
