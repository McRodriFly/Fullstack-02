/* Estado global de la sesión: quién está conectado y con qué rol.
   La sesión vive en localStorage (services/sesion.js), así que se recupera al
   recargar la página. El contexto se suscribe a sus cambios para enterarse también
   de los que ocurren fuera de React: un refresco de token o una sesión vencida. */
import { createContext, useContext, useEffect, useState } from "react";
import { iniciarSesionApi, registrarApi } from "../services/api";
import { borrarSesion, leerSesion, suscribirSesion } from "../services/sesion";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => leerSesion()?.usuario ?? null);

  useEffect(() => suscribirSesion((sesion) => setUsuario(sesion?.usuario ?? null)), []);

  /* Devuelven el usuario autenticado; si el backend rechaza los datos, lanzan
     ErrorApi con su mensaje (credenciales incorrectas, correo ya registrado…). */
  async function iniciarSesion(correo, contrasena) {
    return (await iniciarSesionApi(correo, contrasena)).usuario;
  }

  async function registrarse(datos) {
    return (await registrarApi(datos)).usuario;
  }

  // Los tokens no se guardan en el servidor: cerrar sesión es descartarlos aquí.
  function cerrarSesion() {
    borrarSesion();
  }

  const valor = {
    usuario,
    estaAutenticado: usuario !== null,
    iniciarSesion,
    registrarse,
    cerrarSesion,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
