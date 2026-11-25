package com.audi.store.usuarios.internal.web;

import com.audi.store.usuarios.internal.service.AutenticacionService;
import com.audi.store.usuarios.internal.web.dto.LoginRequest;
import com.audi.store.usuarios.internal.web.dto.RefrescoRequest;
import com.audi.store.usuarios.internal.web.dto.RegistroRequest;
import com.audi.store.usuarios.internal.web.dto.SesionResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Inicio de sesión, registro y renovación del token. Público.")
public class AutenticacionController {

    private final AutenticacionService autenticacionService;

    @PostMapping("/login")
    @Operation(operationId = "iniciarSesion", summary = "Iniciar sesión",
            description = "Devuelve el token de acceso (15 min), el de refresco (7 días) y los datos del usuario. "
                    + "401 si el correo o la contraseña son incorrectos.")
    @ApiResponse(responseCode = "200", description = "Sesión iniciada: tokens y datos del usuario.")
    @ApiResponse(responseCode = "401", description = "Correo o contraseña incorrectos.")
    public SesionResponse login(@Valid @RequestBody LoginRequest datos) {
        return SesionResponse.desde(autenticacionService.iniciarSesion(datos.correo(), datos.contrasena()));
    }

    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(operationId = "registrarCliente", summary = "Registrarse como cliente",
            description = "Crea una cuenta de cliente y deja la sesión iniciada. 409 si el correo ya está registrado.")
    @ApiResponse(responseCode = "201", description = "Cuenta de cliente creada y sesión iniciada.")
    @ApiResponse(responseCode = "409", description = "El correo ya está registrado.")
    public SesionResponse registro(@Valid @RequestBody RegistroRequest datos) {
        return SesionResponse.desde(autenticacionService.registrar(datos.nombre(), datos.correo(), datos.contrasena()));
    }

    @PostMapping("/refresh")
    @Operation(operationId = "renovarTokens", summary = "Renovar los tokens",
            description = "Canjea el token de refresco por un par nuevo, con el rol actual del usuario. "
                    + "401 si el token venció o no es válido: hay que volver a iniciar sesión.")
    @ApiResponse(responseCode = "200", description = "Par de tokens nuevo, con el rol actual del usuario.")
    @ApiResponse(responseCode = "401", description = "El token de refresco venció o no es válido: hay que volver a iniciar sesión.")
    public SesionResponse refrescar(@Valid @RequestBody RefrescoRequest datos) {
        return SesionResponse.desde(autenticacionService.refrescar(datos.tokenRefresco()));
    }
}
