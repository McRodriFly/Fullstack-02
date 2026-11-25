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
@Schema(description = "El carrito al pagar. No trae precios ni totales: el servidor los calcula con el catálogo.")
public record CompraRequest(
        @NotEmpty @Size(max = 50)
        @Schema(description = "Productos a comprar, entre 1 y 50 líneas.")
        List<@Valid @NotNull Item> items,
        @NotNull
        @Schema(description = "Forma de entrega: DESPACHO exige dirección y ciudad; RETIRO las ignora.", example = "DESPACHO")
        TipoEntrega tipoEntrega,
        @Size(max = 200)
        @Schema(description = "Dirección de despacho; obligatoria con DESPACHO.", example = "Av. Siempre Viva 742", nullable = true)
        String direccionEnvio,
        @Size(max = 80)
        @Schema(description = "Ciudad de despacho; obligatoria con DESPACHO.", example = "Santiago", nullable = true)
        String ciudad,
        @Size(max = 30)
        @Schema(description = "Código de cupón (F1AUDI 10 %, NEUBURG2026 15 %). Omitir si no se usa.", example = "F1AUDI", nullable = true)
        String cuponCodigo) {

    @Schema(description = "Una línea del carrito: producto y cantidad.")
    public record Item(
            @NotNull @Schema(description = "Id del producto.", example = "4") Long productoId,
            @NotNull @Positive @Schema(description = "Unidades a comprar; debe ser mayor que cero.", example = "2") Integer cantidad) {
    }

    public DatosCompra aDatos() {
        return new DatosCompra(
                items.stream().map(i -> new DatosCompra.Item(i.productoId(), i.cantidad())).toList(),
                tipoEntrega, direccionEnvio, ciudad, cuponCodigo);
    }
}
