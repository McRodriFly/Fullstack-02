package com.audi.store.catalogo.internal.web.dto;

import com.audi.store.catalogo.internal.domain.Categoria;

public record CategoriaResponse(Long id, String nombre) {

    public static CategoriaResponse desde(Categoria categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getNombre());
    }
}
