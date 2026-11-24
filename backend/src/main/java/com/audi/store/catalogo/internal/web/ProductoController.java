package com.audi.store.catalogo.internal.web;

import com.audi.store.catalogo.internal.service.ProductoService;
import com.audi.store.catalogo.internal.web.dto.ProductoRequest;
import com.audi.store.catalogo.internal.web.dto.ProductoResponse;
import com.audi.store.shared.config.OpenApiConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
@Tag(name = "Productos", description = "Catálogo de la tienda. La lectura es pública; el resto es solo del administrador.")
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    @Operation(summary = "Listar productos", description = "Todo el catálogo o, con categoriaId, solo esa categoría. Público.")
    public List<ProductoResponse> listar(
            @Parameter(description = "Filtra por categoría") @RequestParam(required = false) Long categoriaId) {
        return productoService.listar(categoriaId).stream().map(ProductoResponse::desde).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un producto", description = "Público. 404 si no existe.")
    public ProductoResponse obtener(@PathVariable Long id) {
        return ProductoResponse.desde(productoService.obtener(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(summary = "Crear un producto", description = "Solo administrador. 400 si los datos son inválidos; 404 si la categoría no existe.")
    public ProductoResponse crear(@Valid @RequestBody ProductoRequest datos) {
        return ProductoResponse.desde(productoService.crear(datos.aDatos()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(summary = "Reemplazar un producto", description = "Solo administrador. Reemplaza todos los datos. 404 si el producto o la categoría no existen.")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest datos) {
        return ProductoResponse.desde(productoService.actualizar(id, datos.aDatos()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(summary = "Eliminar un producto", description = "Solo administrador. 404 si no existe; 409 si ya se vendió.")
    public void eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
    }
}
