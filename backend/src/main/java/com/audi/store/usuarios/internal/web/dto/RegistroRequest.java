package com.audi.store.usuarios.internal.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Registro público desde la tienda. No trae rol: la cuenta nueva siempre es de cliente.
 *
 * @param contrasena en claro, entre 4 y 72 caracteres (BCrypt ignora lo que pase de 72 bytes)
 */
@Schema(description = "Registro público desde la tienda. No incluye rol: la cuenta nueva siempre es de cliente.")
public record RegistroRequest(
        @NotBlank @Size(max = 100)
        @Schema(description = "Nombre de la persona. Máximo 100 caracteres.", example = "Ana Pérez")
        String nombre,
        @NotBlank @Email @Size(max = 150)
        @Schema(description = "Correo electrónico; no puede estar registrado.", example = "ana@gmail.com")
        String correo,
        @NotBlank @Size(min = 4, max = 72)
        @Schema(description = "Contraseña en claro, entre 4 y 72 caracteres.", example = "1234")
        String contrasena) {
}
