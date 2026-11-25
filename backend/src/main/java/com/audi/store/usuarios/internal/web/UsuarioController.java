package com.audi.store.usuarios.internal.web;

import com.audi.store.shared.config.OpenApiConfig;
import com.audi.store.shared.security.UsuarioAutenticado;
import com.audi.store.usuarios.internal.service.UsuarioService;
import com.audi.store.usuarios.internal.web.dto.UsuarioActualizacionRequest;
import com.audi.store.usuarios.internal.web.dto.UsuarioRequest;
import com.audi.store.usuarios.internal.web.dto.UsuarioResponse;
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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
    @Operation(operationId = "listarUsuarios", summary = "Listar usuarios", description = "Solo administrador. Nunca devuelve contraseñas.")
    @ApiResponse(responseCode = "200", description = "Todos los usuarios, sin contraseñas.")
    public List<UsuarioResponse> listar() {
        return usuarioService.listar().stream().map(UsuarioResponse::desde).toList();
    }

    @GetMapping("/{id}")
    @Operation(operationId = "obtenerUsuario", summary = "Obtener un usuario", description = "Solo administrador. 404 si no existe.")
    @ApiResponse(responseCode = "200", description = "El usuario pedido.")
    @ApiResponse(responseCode = "404", description = "No existe un usuario con ese id.")
    public UsuarioResponse obtener(@Parameter(description = "Id del usuario.") @PathVariable Long id) {
        return UsuarioResponse.desde(usuarioService.obtener(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(operationId = "crearUsuario", summary = "Crear un usuario con cualquier rol", description = "Solo administrador. 409 si el correo ya está registrado.")
    @ApiResponse(responseCode = "201", description = "Usuario creado.")
    @ApiResponse(responseCode = "409", description = "El correo ya está registrado.")
    public UsuarioResponse crear(@Valid @RequestBody UsuarioRequest datos) {
        return UsuarioResponse.desde(usuarioService.crear(datos.aDatos()));
    }

    @PutMapping("/{id}")
    @Operation(operationId = "actualizarUsuario", summary = "Actualizar un usuario",
            description = "Solo administrador. Sin contraseña conserva la actual. 409 si el correo ya lo usa otro "
                    + "usuario o si el administrador intenta cambiar su propio rol.")
    @ApiResponse(responseCode = "200", description = "Usuario actualizado.")
    @ApiResponse(responseCode = "404", description = "No existe un usuario con ese id.")
    @ApiResponse(responseCode = "409", description = "El correo ya lo usa otro usuario, o el administrador intentó cambiar su propio rol.")
    public UsuarioResponse actualizar(
            @Parameter(description = "Id del usuario.") @PathVariable Long id,
            @Valid @RequestBody UsuarioActualizacionRequest datos,
            @AuthenticationPrincipal UsuarioAutenticado solicitante) {
        return UsuarioResponse.desde(usuarioService.actualizar(id, datos.aDatos(), solicitante.id()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "eliminarUsuario", summary = "Eliminar un usuario",
            description = "Solo administrador. 409 si es su propia cuenta o si el usuario tiene compras registradas.")
    @ApiResponse(responseCode = "204", description = "Usuario eliminado; sin contenido.")
    @ApiResponse(responseCode = "404", description = "No existe un usuario con ese id.")
    @ApiResponse(responseCode = "409", description = "Es la cuenta del propio administrador o el usuario tiene compras registradas.")
    public void eliminar(@Parameter(description = "Id del usuario.") @PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado solicitante) {
        usuarioService.eliminar(id, solicitante.id());
    }
}
