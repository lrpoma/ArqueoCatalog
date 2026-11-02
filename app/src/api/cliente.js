import { create } from 'axios';

import { API_URL } from './config';
import { borrarTokens, guardarTokens, leerAccess, leerRefresh } from './sesion';

export const cliente = create({ baseURL: API_URL, timeout: 10000 });

// Se llama cuando el refresh también falla: la sesión terminó y hay que volver al login.
let alExpirarSesion = () => {};
export const registrarExpiracion = (funcion) => {
  alExpirarSesion = funcion;
};

cliente.interceptors.request.use(async (config) => {
  const access = await leerAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// Un solo refresh a la vez aunque varias peticiones fallen juntas con 401.
let refrescando = null;

async function refrescarAccess() {
  const refresh = await leerRefresh();
  if (!refresh) throw new Error('sin refresh');
  const { data } = await create({ baseURL: API_URL, timeout: 10000 }).post('/auth/refresh/', { refresh });
  await guardarTokens({ access: data.access, refresh: data.refresh });
  return data.access;
}

cliente.interceptors.response.use(
  (respuesta) => respuesta,
  async (error) => {
    const original = error.config;
    const esLogin = original?.url?.includes('/auth/login/');
    if (error.response?.status !== 401 || original._reintento || esLogin) throw error;

    original._reintento = true;
    try {
      refrescando = refrescando ?? refrescarAccess();
      const access = await refrescando;
      original.headers.Authorization = `Bearer ${access}`;
      return cliente(original);
    } catch {
      await borrarTokens();
      alExpirarSesion();
      throw error;
    } finally {
      refrescando = null;
    }
  },
);

// Mensaje claro para el usuario según el tipo de fallo.
export function mensajeDeError(error) {
  if (!error.response) return 'No se pudo conectar con el servidor. Revisa tu red y la dirección del API.';
  switch (error.response.status) {
    case 400:
    case 401:
      return 'Usuario o contraseña incorrectos.';
    case 429:
      return 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.';
    default:
      return 'El servidor tuvo un problema. Inténtalo más tarde.';
  }
}
