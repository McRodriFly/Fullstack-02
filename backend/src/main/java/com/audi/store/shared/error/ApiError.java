package com.audi.store.shared.error;

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
public record ApiError(
        LocalDateTime fecha,
        int estado,
        String error,
        String mensaje,
        String ruta,
        List<String> detalles) {
}
