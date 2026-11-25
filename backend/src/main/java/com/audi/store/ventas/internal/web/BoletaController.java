package com.audi.store.ventas.internal.web;

import com.audi.store.shared.config.OpenApiConfig;
import com.audi.store.shared.security.UsuarioAutenticado;
import com.audi.store.ventas.internal.domain.Boleta;
import com.audi.store.ventas.internal.service.BoletaService;
import com.audi.store.ventas.internal.web.dto.BoletaResponse;
import com.audi.store.ventas.internal.web.dto.CompraRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/boletas")
@RequiredArgsConstructor
@Tag(name = "Boletas", description = "Órdenes de compra. El cliente compra y ve las suyas; administrador y vendedor consultan todas.")
public class BoletaController {

    private final BoletaService boletaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(operationId = "pagarCarrito", summary = "Pagar el carrito",
            description = "Cliente o administrador con sesión. Cobra el precio vigente del catálogo y descuenta el stock. "
                    + "400 si el carrito, la entrega o el cupón no son válidos; 404 si un producto no existe; "
                    + "409 si no hay stock suficiente.")
    @ApiResponse(responseCode = "201", description = "Compra registrada: la boleta con su detalle, el total y el stock ya descontado.")
    @ApiResponse(responseCode = "400", description = "El carrito, la entrega o el cupón no son válidos.")
    @ApiResponse(responseCode = "404", description = "Un producto del carrito no existe.")
    @ApiResponse(responseCode = "409", description = "No hay stock suficiente de un producto.")
    public BoletaResponse comprar(
            @Valid @RequestBody CompraRequest compra, @AuthenticationPrincipal UsuarioAutenticado comprador) {
        Boleta boleta = boletaService.crear(comprador.id(), compra.aDatos());
        return BoletaResponse.desde(boleta, boletaService.productosDe(List.of(boleta)));
    }

    @GetMapping("/mias")
    @PreAuthorize("hasAnyRole('CLIENTE', 'ADMIN')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(operationId = "misCompras", summary = "Mis compras", description = "Las boletas del usuario de la sesión, de la más reciente a la más antigua.")
    @ApiResponse(responseCode = "200", description = "Boletas del usuario de la sesión, de la más reciente a la más antigua.")
    public List<BoletaResponse> mias(@AuthenticationPrincipal UsuarioAutenticado comprador) {
        return responder(boletaService.listarDe(comprador.id()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(operationId = "listarBoletas", summary = "Listar todas las boletas", description = "Administrador y vendedor. De la más reciente a la más antigua.")
    @ApiResponse(responseCode = "200", description = "Todas las boletas, de la más reciente a la más antigua.")
    public List<BoletaResponse> listar() {
        return responder(boletaService.listar());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    @SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
    @Operation(operationId = "obtenerBoleta", summary = "Obtener una boleta con su detalle", description = "Administrador y vendedor. 404 si no existe.")
    @ApiResponse(responseCode = "200", description = "La boleta con su detalle.")
    @ApiResponse(responseCode = "404", description = "No existe una boleta con ese id.")
    public BoletaResponse obtener(@Parameter(description = "Id de la boleta.") @PathVariable Long id) {
        Boleta boleta = boletaService.obtener(id);
        return BoletaResponse.desde(boleta, boletaService.productosDe(List.of(boleta)));
    }

    private List<BoletaResponse> responder(List<Boleta> boletas) {
        var productos = boletaService.productosDe(boletas);
        return boletas.stream().map(b -> BoletaResponse.desde(b, productos)).toList();
    }
}
