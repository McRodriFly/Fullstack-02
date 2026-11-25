package com.audi.store.usuarios.internal.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Registro público desde la tienda. No trae rol: la cuenta nueva siempre es de cliente.
 *
 * @param contrasena en claro, entre 4 y 72 caracteres (BCrypt ignora lo que pase de 72 bytes)
 */
public record RegistroRequest(
        @NotBlank @Size(max = 100) String nombre,
        @NotBlank @Email @Size(max = 150) String correo,
        @NotBlank @Size(min = 4, max = 72) String contrasena) {
}
