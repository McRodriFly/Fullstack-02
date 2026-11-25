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
@Schema(description = "Datos de un producto al crearlo o reemplazarlo. Un PUT reemplaza todos los campos.")
public record ProductoRequest(
        @NotBlank @Size(max = 150)
        @Schema(description = "Nombre del producto. Máximo 150 caracteres.", example = "Gorra Edición Especial")
        String nombre,
        @NotNull
        @Schema(description = "Id de una categoría existente.", example = "3")
        Long categoriaId,
        @NotNull @PositiveOrZero @Digits(integer = 12, fraction = 0)
        @Schema(description = "Precio normal en pesos chilenos, sin decimales.", example = "35000")
        BigDecimal precio,
        @PositiveOrZero @Digits(integer = 12, fraction = 0)
        @Schema(description = "Precio en oferta en pesos; debe ser menor que el precio normal. Omitir si no está en oferta.",
                example = "28000", nullable = true)
        BigDecimal precioOferta,
        @NotBlank @Size(max = 255)
        @Schema(description = "Nombre del archivo de la imagen del producto.", example = "Gorra1.jpeg")
        String imagen,
        @NotNull @PositiveOrZero
        @Schema(description = "Unidades disponibles para la venta.", example = "8")
        Integer stock) {

    public DatosProducto aDatos() {
        return new DatosProducto(nombre, categoriaId, precio, precioOferta, imagen, stock);
    }
}
