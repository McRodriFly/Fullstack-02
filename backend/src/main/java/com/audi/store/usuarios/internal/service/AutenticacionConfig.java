package com.audi.store.usuarios.internal.service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
class AutenticacionConfig {

    /**
     * Comprueba correo y contraseña contra la base de datos con BCrypt.
     *
     * <p>{@link DaoAuthenticationProvider} responde lo mismo, y en un tiempo parecido, si el correo
     * no existe o si la contraseña es incorrecta: así no revela qué correos están registrados.
     */
    @Bean
    AuthenticationManager autenticador(CuentaDetailsService cuentas, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider proveedor = new DaoAuthenticationProvider(cuentas);
        proveedor.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(proveedor);
    }
}
