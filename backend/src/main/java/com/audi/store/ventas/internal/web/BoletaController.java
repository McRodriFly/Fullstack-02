package com.audi.store.ventas.internal.web;

import com.audi.store.shared.config.OpenApiConfig;
import com.audi.store.ventas.internal.domain.Boleta;
import com.audi.store.ventas.internal.service.BoletaService;
import com.audi.store.ventas.internal.web.dto.BoletaResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/boletas")
@RequiredArgsConstructor
@Tag(name = "Boletas", description = "Órdenes de compra. Administrador y vendedor las consultan.")
public class BoletaController {

    private final BoletaService boletaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(summary = "Listar todas las boletas", description = "Administrador y vendedor. De la más reciente a la más antigua.")
    public List<BoletaResponse> listar() {
        List<Boleta> boletas = boletaService.listar();
        var productos = boletaService.productosDe(boletas);
        return boletas.stream().map(b -> BoletaResponse.desde(b, productos)).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(summary = "Obtener una boleta con su detalle", description = "Administrador y vendedor. 404 si no existe.")
    public BoletaResponse obtener(@PathVariable Long id) {
        Boleta boleta = boletaService.obtener(id);
        return BoletaResponse.desde(boleta, boletaService.productosDe(List.of(boleta)));
    }
}
