// URL del backend. En desarrollo con Expo Go usar la IP de la PC en la red local,
// por ejemplo EXPO_PUBLIC_API_URL=http://192.168.1.10:8000/api/v1
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

// URL de una foto de pieza. Pasa por /media/{id}/ (control de visibilidad), no por /media/ estático.
export const urlFoto = (id, miniatura = false) => `${API_URL}/media/${id}/${miniatura ? '?miniatura=1' : ''}`;
