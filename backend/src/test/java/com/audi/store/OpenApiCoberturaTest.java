package com.audi.store;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

/**
 * La especificación OpenAPI publicada en {@code /v3/api-docs} describe por completo la API: cada
 * endpoint con resumen, descripción y respuestas, y cada campo de los DTOs con descripción y ejemplo.
 * Si alguien agrega un endpoint o un campo sin documentarlo, esta prueba falla.
 */
class OpenApiCoberturaTest extends IntegracionBase {

    private static final Set<String> METODOS = Set.of("get", "post", "put", "delete", "patch");

    @Autowired
    private MockMvc mvc;

    private Map<String, Object> api;

    private Map<String, Object> especificacion() throws Exception {
        if (api == null) {
            String json = mvc.perform(get("/v3/api-docs")).andExpect(status().isOk())
                    .andReturn().getResponse().getContentAsString();
            api = JsonPath.parse(json).read("$");
        }
        return api;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Map<String, Object>> operaciones() throws Exception {
        Map<String, Map<String, Object>> todas = new java.util.TreeMap<>();
        ((Map<String, Map<String, Object>>) especificacion().get("paths")).forEach((ruta, item) ->
                item.forEach((metodo, op) -> {
                    if (METODOS.contains(metodo)) {
                        todas.put(metodo.toUpperCase() + " " + ruta, (Map<String, Object>) op);
                    }
                }));
        return todas;
    }

    @Test
    void documentaLos22EndpointsConResumenDescripcionYGrupo() throws Exception {
        var operaciones = operaciones();

        assertThat(operaciones).hasSize(22);
        operaciones.forEach((nombre, op) -> {
            assertThat(op.get("summary")).as("%s: resumen", nombre).asString().isNotBlank();
            assertThat(op.get("description")).as("%s: descripción", nombre).asString().isNotBlank();
            assertThat((List<?>) op.get("tags")).as("%s: grupo", nombre).isNotEmpty();
        });
    }

    @Test
    @SuppressWarnings("unchecked")
    void cadaEndpointDeclaraSusRespuestasYLosErroresUsanApiError() throws Exception {
        operaciones().forEach((nombre, op) -> {
            Map<String, Map<String, Object>> respuestas = (Map<String, Map<String, Object>>) op.get("responses");
            assertThat(respuestas.keySet()).as("%s: respuestas", nombre).anyMatch(c -> c.startsWith("2"));
            respuestas.forEach((codigo, r) -> {
                assertThat(r.get("description")).as("%s %s: descripción", nombre, codigo).asString().isNotBlank();
                if (codigo.startsWith("4") || codigo.startsWith("5")) {
                    assertThat(r.toString()).as("%s %s: esquema de error", nombre, codigo)
                            .contains("#/components/schemas/ApiError");
                }
            });
            if (op.containsKey("requestBody") || op.containsKey("parameters")) {
                assertThat(respuestas).as("%s: 400", nombre).containsKey("400");
            }
            if (op.containsKey("security")) {
                assertThat(respuestas).as("%s: 401 y 403", nombre).containsKeys("401", "403");
            }
            // Los de escritura declaran los conflictos propios (409) o la ausencia del recurso (404).
            if (nombre.startsWith("DELETE") || nombre.startsWith("PUT")) {
                assertThat(respuestas).as("%s: 404", nombre).containsKey("404");
            }
        });
    }

    @Test
    @SuppressWarnings("unchecked")
    void cadaEndpointTieneUnIdentificadorUnicoYResponderJson() throws Exception {
        var operaciones = operaciones();
        var ids = operaciones.values().stream().map(op -> (String) op.get("operationId")).toList();

        assertThat(ids).doesNotContainNull().doesNotHaveDuplicates().noneMatch(id -> id.matches(".*_[0-9]+"));
        operaciones.forEach((nombre, op) -> {
            Map<String, Map<String, Object>> respuestas = (Map<String, Map<String, Object>>) op.get("responses");
            respuestas.forEach((codigo, r) -> {
                if (r.containsKey("content")) {
                    assertThat(((Map<String, Object>) r.get("content")).keySet())
                            .as("%s %s: tipo de contenido", nombre, codigo).containsExactly("application/json");
                }
            });
        });
    }

    @Test
    @SuppressWarnings("unchecked")
    void cadaParametroTieneDescripcion() throws Exception {
        operaciones().forEach((nombre, op) ->
                ((List<Map<String, Object>>) op.getOrDefault("parameters", List.of())).forEach(p ->
                        assertThat(p.get("description")).as("%s: parámetro %s", nombre, p.get("name"))
                                .asString().isNotBlank()));
    }

    @Test
    @SuppressWarnings("unchecked")
    void cadaEsquemaYCadaCampoTienenDescripcionYLosSimplesEjemplo() throws Exception {
        Map<String, Map<String, Object>> esquemas =
                (Map<String, Map<String, Object>>) ((Map<String, Object>) especificacion().get("components")).get("schemas");
        List<String> faltas = new ArrayList<>();
        esquemas.forEach((nombre, esquema) -> {
            if (!esquema.containsKey("description")) {
                faltas.add(nombre + ": sin descripción del esquema");
            }
            ((Map<String, Map<String, Object>>) esquema.getOrDefault("properties", Map.of())).forEach((campo, p) -> {
                if (!p.containsKey("description")) {
                    faltas.add(nombre + "." + campo + ": sin descripción");
                }
                boolean simple = p.containsKey("type") && !Set.of("object", "array").contains(p.get("type"));
                if (simple && !p.containsKey("example") && !p.containsKey("examples")) {
                    faltas.add(nombre + "." + campo + ": sin ejemplo");
                }
            });
        });
        assertThat(faltas).as("Campos sin documentar").isEmpty();
    }
}
