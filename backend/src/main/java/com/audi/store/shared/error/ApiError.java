package com.audi.store.shared.error;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Formato único de error de toda la API.
 *
 * @param estado   código HTTP
 * @param error    descripción estándar del código ("Not Found", "Conflict"…)
 * @param mensaje  explicación pensada para mostrarse al usuario
 * @param ruta     ruta de la solicitud que falló
 * @param detalles errores por campo cuando falla la validación; vacío en los demás casos
 */
@Schema(description = "Formato único de error de toda la API.")
public record ApiError(
        @Schema(description = "Fecha y hora en que ocurrió el error.", example = "2026-11-25T12:55:03.1") LocalDateTime fecha,
        @Schema(description = "Código HTTP de la respuesta.", example = "409") int estado,
        @Schema(description = "Descripción estándar del código HTTP.", example = "Conflict") String error,
        @Schema(description = "Explicación en español pensada para mostrarse al usuario.",
                example = "Stock insuficiente para el producto 9: pedido 6, disponible 5") String mensaje,
        @Schema(description = "Ruta de la solicitud que falló.", example = "/api/v1/boletas") String ruta,
        @Schema(description = "Errores por campo cuando falla la validación; vacío en los demás casos.",
                example = "[\"precio: debe ser mayor o igual a 0\"]")
        List<String> detalles) {
}
