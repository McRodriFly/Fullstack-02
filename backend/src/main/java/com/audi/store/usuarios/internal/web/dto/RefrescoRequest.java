package com.audi.store.usuarios.internal.web.dto;

import jakarta.validation.constraints.NotBlank;

/** @param tokenRefresco el que se recibió al iniciar sesión o en el último refresco */
public record RefrescoRequest(@NotBlank String tokenRefresco) {
}
