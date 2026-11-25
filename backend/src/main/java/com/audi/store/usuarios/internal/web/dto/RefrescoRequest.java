package com.audi.store.usuarios.internal.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

/** @param tokenRefresco el que se recibió al iniciar sesión o en el último refresco */
@Schema(description = "Token de refresco para obtener un par de tokens nuevo.")
public record RefrescoRequest(
        @NotBlank
        @Schema(description = "Token de refresco recibido al iniciar sesión o en el último refresco (vale 7 días).",
                example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.firma")
        String tokenRefresco) {
}
