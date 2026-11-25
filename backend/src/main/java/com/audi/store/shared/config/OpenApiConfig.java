package com.audi.store.shared.config;

import com.audi.store.shared.error.ApiError;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityScheme;
import java.util.TreeMap;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Metadatos de la documentación OpenAPI, el esquema de autenticación Bearer (JWT) y las respuestas de
 * error que comparten todos los endpoints.
 *
 * <p>Cada controlador documenta con {@code @ApiResponse} lo propio de su endpoint (éxito, 404, 409…).
 * Lo que se repite en todos se completa aquí: 400 en los que reciben datos, 401 y 403 en los privados.
 */
@Configuration
public class OpenApiConfig {

    /** Nombre del esquema; los controladores lo referencian con {@code @SecurityRequirement}. */
    public static final String ESQUEMA_JWT = "bearerAuth";

    private static final String JSON = "application/json";
    private static final String REF_ERROR = "#/components/schemas/ApiError";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Audi F1 Store API")
                        .version("v1")
                        .description("API REST de la tienda: catálogo, usuarios y boletas. Los errores de toda la API "
                                + "tienen el formato del esquema ApiError. Las rutas privadas piden el token de acceso "
                                + "en el encabezado Authorization: Bearer."))
                .components(new Components().addSecuritySchemes(ESQUEMA_JWT,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }

    /** Completa las respuestas de error comunes y hace que todas usen el esquema {@code ApiError}. */
    @Bean
    public OpenApiCustomizer respuestasDeError() {
        return openApi -> {
            registrarApiError(openApi);
            if (openApi.getPaths() == null) {
                return;
            }
            openApi.getPaths().values().forEach(ruta -> ruta.readOperations().forEach(this::completar));
        };
    }

    private void registrarApiError(OpenAPI openApi) {
        if (openApi.getComponents() == null) {
            openApi.setComponents(new Components());
        }
        ModelConverters.getInstance(true).readAll(ApiError.class).forEach((nombre, esquema) -> {
            if (openApi.getComponents().getSchemas() == null
                    || !openApi.getComponents().getSchemas().containsKey(nombre)) {
                openApi.getComponents().addSchemas(nombre, esquema);
            }
        });
    }

    private void completar(Operation operacion) {
        boolean privada = operacion.getSecurity() != null && !operacion.getSecurity().isEmpty();
        boolean recibeDatos = operacion.getRequestBody() != null
                || (operacion.getParameters() != null && !operacion.getParameters().isEmpty());

        if (recibeDatos) {
            agregar(operacion, "400", "Solicitud inválida: falta un dato, está mal formado o no cumple las "
                    + "validaciones. Los campos con problema se listan en «detalles».");
        }
        if (privada) {
            agregar(operacion, "401", "Sin sesión, o el token de acceso venció o no es válido.");
            agregar(operacion, "403", "La sesión no tiene el rol necesario para esta operación.");
        }
        // Toda respuesta de error, la haya declarado el controlador o no, usa el mismo formato.
        operacion.getResponses().forEach((codigo, respuesta) -> {
            if (codigo.startsWith("4") || codigo.startsWith("5")) {
                respuesta.setContent(new Content().addMediaType(JSON,
                        new MediaType().schema(new Schema<>().$ref(REF_ERROR))));
            }
        });
        ordenarPorCodigo(operacion);
    }

    /** Deja las respuestas en orden de código (200, 400, 401…) en lugar del orden en que se agregaron. */
    private void ordenarPorCodigo(Operation operacion) {
        ApiResponses ordenadas = new ApiResponses();
        new TreeMap<>(operacion.getResponses()).forEach(ordenadas::addApiResponse);
        operacion.setResponses(ordenadas);
    }

    private void agregar(Operation operacion, String codigo, String descripcion) {
        if (!operacion.getResponses().containsKey(codigo)) {
            operacion.getResponses().addApiResponse(codigo, new ApiResponse().description(descripcion));
        }
    }
}
