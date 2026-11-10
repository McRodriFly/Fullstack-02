/* =========================================================
   SERVICIO API REST (Conexión Frontend ⇄ Backend Spring Boot)
   Comunica la tienda React con el backend en http://localhost:8080/api/v1
========================================================= */

const API_BASE = "http://localhost:8080/api/v1";

// Obtener todos los productos desde el Backend Spring Boot
export async function fetchProductosAPI() {
  try {
    const response = await fetch(`${API_BASE}/productos`);
    if (!response.ok) throw new Error("Error al conectar con el backend de productos");
    return await response.json();
  } catch (error) {
    console.warn("⚠️ Backend no disponible. Usando respaldo local.", error);
    return null; // fallback para que la tienda no falle si el backend está apagado
  }
}

// Obtener productos en oferta desde el Backend
export async function fetchOfertasAPI() {
  try {
    const response = await fetch(`${API_BASE}/productos/ofertas`);
    if (!response.ok) throw new Error("Error al conectar con el backend de ofertas");
    return await response.json();
  } catch (error) {
    return null;
  }
}

// Login contra el Backend Spring Boot
export async function loginAPI(correo, password) {
  try {
    const response = await fetch(`${API_BASE}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, password }),
    });
    if (!response.ok) return { success: false, message: "Credenciales inválidas" };
    const usuario = await response.json();
    return { success: true, usuario };
  } catch (error) {
    return { success: false, message: "Error de conexión con el servidor" };
  }
}
