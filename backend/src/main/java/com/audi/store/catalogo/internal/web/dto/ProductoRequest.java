package com.audi.store.catalogo.internal.web.dto;

import com.audi.store.catalogo.internal.service.DatosProducto;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Datos de un producto al crearlo o reemplazarlo.
 *
 * @param precioOferta menor que {@code precio}; omitir o enviar {@code null} si no está en oferta
 */
public record ProductoRequest(
        @NotBlank @Size(max = 150) String nombre,
        @NotNull Long categoriaId,
        @NotNull @PositiveOrZero @Digits(integer = 12, fraction = 0) @Schema(example = "35000") BigDecimal precio,
        @PositiveOrZero @Digits(integer = 12, fraction = 0) @Schema(example = "28000") BigDecimal precioOferta,
        @NotBlank @Size(max = 255) @Schema(example = "Gorra1.jpeg") String imagen,
        @NotNull @PositiveOrZero Integer stock) {

    public DatosProducto aDatos() {
        return new DatosProducto(nombre, categoriaId, precio, precioOferta, imagen, stock);
    }
}
