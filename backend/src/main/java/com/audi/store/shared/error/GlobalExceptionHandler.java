package com.audi.store.shared.error;

import java.time.LocalDateTime;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.TypeMismatchException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Traduce toda excepción a un {@link ApiError}, de modo que el frontend reciba siempre el mismo
 * formato.
 *
 * <p>Extiende {@link ResponseEntityExceptionHandler} para cubrir también los errores propios de
 * Spring MVC (ruta inexistente, método no permitido, parámetros mal formados) sin duplicarlos.
 *
 * <ul>
 *   <li>400: datos inválidos, JSON mal formado o regla de negocio incumplida.</li>
 *   <li>401 y 403: sin sesión y sin permiso.</li>
 *   <li>404: el recurso no existe.</li>
 *   <li>409: choca con el estado actual de los datos.</li>
 *   <li>500: cualquier fallo no previsto; el detalle se registra en el log y no se devuelve.</li>
 * </ul>
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    ResponseEntity<ApiError> recursoNoEncontrado(RecursoNoEncontradoException e, WebRequest request) {
        return responder(HttpStatus.NOT_FOUND, e.getMessage(), request, List.of());
    }

    @ExceptionHandler(SolicitudInvalidaException.class)
    ResponseEntity<ApiError> solicitudInvalida(SolicitudInvalidaException e, WebRequest request) {
        return responder(HttpStatus.BAD_REQUEST, e.getMessage(), request, List.of());
    }

    @ExceptionHandler(ConflictoException.class)
    ResponseEntity<ApiError> conflicto(ConflictoException e, WebRequest request) {
        return responder(HttpStatus.CONFLICT, e.getMessage(), request, List.of());
    }

    /**
     * Última defensa de las restricciones de la base de datos. Los servicios comprueban antes las
     * reglas conocidas; esto cubre las carreras, por ejemplo dos registros simultáneos con el
     * mismo correo.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> integridadDeDatos(DataIntegrityViolationException e, WebRequest request) {
        log.warn("Violación de integridad: {}", e.getMostSpecificCause().getMessage());
        return responder(HttpStatus.CONFLICT, "La operación choca con datos ya existentes", request, List.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiError> sinPermiso(AccessDeniedException e, WebRequest request) {
        return responder(HttpStatus.FORBIDDEN, "No tienes permiso para realizar esta acción", request, List.of());
    }

    /** Credenciales incorrectas o token rechazado: el mensaje dice cuál fue el motivo. */
    @ExceptionHandler(NoAutenticadoException.class)
    ResponseEntity<ApiError> noAutenticado(NoAutenticadoException e, WebRequest request) {
        return responder(HttpStatus.UNAUTHORIZED, e.getMessage(), request, List.of());
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiError> sinSesion(AuthenticationException e, WebRequest request) {
        return responder(HttpStatus.UNAUTHORIZED, "Debes iniciar sesión", request, List.of());
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> inesperado(Exception e, WebRequest request) {
        log.error("Error no previsto en {}", rutaDe(request), e);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado", request, List.of());
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException e, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<String> detalles = e.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .sorted()
                .toList();
        return comoObjeto(responder(HttpStatus.BAD_REQUEST, "Hay datos inválidos en la solicitud", request, detalles));
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException e, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return comoObjeto(responder(HttpStatus.BAD_REQUEST,
                "El cuerpo de la solicitud falta o no es un JSON válido", request, List.of()));
    }

    @Override
    protected ResponseEntity<Object> handleTypeMismatch(
            TypeMismatchException e, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return comoObjeto(responder(HttpStatus.BAD_REQUEST,
                "El valor del parámetro '" + e.getPropertyName() + "' no es válido", request, List.of()));
    }

    /** Resto de errores de Spring MVC: conserva su código y usa el mismo formato. */
    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception e, @Nullable Object body, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String mensaje = body instanceof ProblemDetail problema && problema.getDetail() != null
                ? problema.getDetail()
                : HttpStatus.valueOf(status.value()).getReasonPhrase();
        return comoObjeto(responder(HttpStatus.valueOf(status.value()), mensaje, request, List.of()));
    }

    private ResponseEntity<ApiError> responder(
            HttpStatus estado, String mensaje, WebRequest request, List<String> detalles) {
        ApiError error = new ApiError(
                LocalDateTime.now(), estado.value(), estado.getReasonPhrase(), mensaje, rutaDe(request), detalles);
        return ResponseEntity.status(estado).body(error);
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private static ResponseEntity<Object> comoObjeto(ResponseEntity<ApiError> respuesta) {
        return (ResponseEntity) respuesta;
    }

    // getDescription(false) devuelve "uri=/api/v1/..."; se quita el prefijo.
    private static String rutaDe(WebRequest request) {
        return request.getDescription(false).replaceFirst("^uri=", "");
    }
}
