package com.audi.store.catalogo.internal.web.dto;

import com.audi.store.catalogo.internal.domain.Categoria;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Categoría del catálogo.")
public record CategoriaResponse(
        @Schema(description = "Identificador de la categoría.", example = "3") Long id,
        @Schema(description = "Nombre de la categoría.", example = "Gorras") String nombre) {

    public static CategoriaResponse desde(Categoria categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getNombre());
    }
}
