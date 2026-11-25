package com.audi.store.usuarios.internal.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank @Size(max = 150) @Schema(example = "cliente@gmail.com") String correo,
        @NotBlank @Size(max = 72) @Schema(example = "1234") String contrasena) {
}
