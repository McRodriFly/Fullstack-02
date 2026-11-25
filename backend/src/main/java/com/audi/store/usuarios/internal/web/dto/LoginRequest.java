package com.audi.store.usuarios.internal.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Credenciales para iniciar sesión.")
public record LoginRequest(
        @NotBlank @Size(max = 150)
        @Schema(description = "Correo con el que se registró la cuenta.", example = "cliente@gmail.com")
        String correo,
        @NotBlank @Size(max = 72)
        @Schema(description = "Contraseña en claro; el servidor la compara con su hash BCrypt.", example = "1234")
        String contrasena) {
}
