package com.audi.store.shared.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Codificador de contraseñas compartido por el registro de usuarios y el inicio de sesión. */
@Configuration
public class PasswordEncoderConfig {

    /** BCrypt con costo 10, el mismo con que se generaron los hashes de los datos semilla. */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
