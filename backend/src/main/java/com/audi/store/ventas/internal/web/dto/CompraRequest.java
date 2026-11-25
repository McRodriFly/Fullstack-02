package com.audi.store.ventas.internal.web.dto;

import com.audi.store.ventas.internal.domain.TipoEntrega;
import com.audi.store.ventas.internal.service.DatosCompra;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * El carrito al pagar. No trae precios ni totales: el servidor los calcula con el catálogo.
 *
 * @param direccionEnvio obligatoria con despacho; se ignora con retiro en tienda
 * @param ciudad         obligatoria con despacho; se ignora con retiro en tienda
 * @param cuponCodigo    omitir si no se usa cupón
 */
public record CompraRequest(
        @NotEmpty @Size(max = 50) List<@Valid @NotNull Item> items,
        @NotNull TipoEntrega tipoEntrega,
        @Size(max = 200) @Schema(example = "Av. Siempre Viva 742") String direccionEnvio,
        @Size(max = 80) @Schema(example = "Santiago") String ciudad,
        @Size(max = 30) @Schema(example = "F1AUDI") String cuponCodigo) {

    public record Item(
            @NotNull @Schema(example = "4") Long productoId,
            @NotNull @Positive @Schema(example = "2") Integer cantidad) {
    }

    public DatosCompra aDatos() {
        return new DatosCompra(
                items.stream().map(i -> new DatosCompra.Item(i.productoId(), i.cantidad())).toList(),
                tipoEntrega, direccionEnvio, ciudad, cuponCodigo);
    }
}
