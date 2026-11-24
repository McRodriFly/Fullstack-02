package com.audi.store.usuarios.internal.web;

import com.audi.store.shared.config.OpenApiConfig;
import com.audi.store.usuarios.internal.service.UsuarioService;
import com.audi.store.usuarios.internal.web.dto.UsuarioRequest;
import com.audi.store.usuarios.internal.web.dto.UsuarioResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = OpenApiConfig.ESQUEMA_JWT)
@Tag(name = "Usuarios", description = "Administración de cuentas. Solo el administrador.")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Solo administrador. Nunca devuelve contraseñas.")
    public List<UsuarioResponse> listar() {
        return usuarioService.listar().stream().map(UsuarioResponse::desde).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un usuario", description = "Solo administrador. 404 si no existe.")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return UsuarioResponse.desde(usuarioService.obtener(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Crear un usuario con cualquier rol", description = "Solo administrador. 409 si el correo ya está registrado.")
    public UsuarioResponse crear(@Valid @RequestBody UsuarioRequest datos) {
        return UsuarioResponse.desde(usuarioService.crear(datos.aDatos()));
    }
}
