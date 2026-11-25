package com.audi.store.catalogo.internal.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Datos de una categoría al crearla o renombrarla.")
public record CategoriaRequest(
        @NotBlank @Size(max = 60)
        @Schema(description = "Nombre de la categoría; no puede repetirse. Máximo 60 caracteres.", example = "Gorras")
        String nombre) {
}
