// URL del backend. En desarrollo con Expo Go usar la IP de la PC en la red local,
// por ejemplo EXPO_PUBLIC_API_URL=http://192.168.1.10:8000/api/v1
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

// Las rutas de fotos y QR que devuelve el API son relativas al servidor, sin el prefijo /api/v1.
export const urlAbsoluta = (ruta) => API_URL.replace(/\/api\/v1\/?$/, '') + ruta;
