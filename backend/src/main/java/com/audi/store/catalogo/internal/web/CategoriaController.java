package com.audi.store.catalogo.internal.web;

import com.audi.store.catalogo.internal.service.CategoriaService;
import com.audi.store.catalogo.internal.web.dto.CategoriaRequest;
import com.audi.store.catalogo.internal.web.dto.CategoriaResponse;
import com.audi.store.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/categorias")
@RequiredArgsConstructor
@Tag(name = "Categorías", description = "Agrupaciones de productos. La lectura es pública; el resto es solo del administrador.")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    @Operation(summary = "Listar categorías", description = "Ordenadas por nombre. Público.")
    public List<CategoriaResponse> listar() {
        return categoriaService.listar().stream().map(CategoriaResponse::desde).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener una categoría", description = "Público. 404 si no existe.")
    public CategoriaResponse obtener(@PathVariable Long id) {
        return CategoriaResponse.desde(categoriaService.obtener(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(summary = "Crear una categoría", description = "Solo administrador. 409 si el nombre ya existe.")
    public CategoriaResponse crear(@Valid @RequestBody CategoriaRequest datos) {
        return CategoriaResponse.desde(categoriaService.crear(datos.nombre()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(summary = "Renombrar una categoría", description = "Solo administrador. 404 si no existe; 409 si el nombre ya existe.")
    public CategoriaResponse actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest datos) {
        return CategoriaResponse.desde(categoriaService.actualizar(id, datos.nombre()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(summary = "Eliminar una categoría", description = "Solo administrador. 404 si no existe; 409 si todavía tiene productos.")
    public void eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
    }
}
