import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';

import { cliente } from '../api/cliente';
import { leerAccess } from '../api/sesion';
import { colores } from '../tema';

// Las fotos pasan por /media/{id}/ (control de visibilidad), así que la imagen lleva el JWT.
// Si falla (p. ej. token vencido) se fuerza un refresh con una llamada autenticada y se reintenta una vez.
export default function FotoProtegida({ uri, style, resizeMode = 'cover' }) {
  const [token, setToken] = useState(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    leerAccess().then(setToken);
  }, [intento]);

  if (!token) return <View style={[style, { backgroundColor: colores.linea }]} />;
  return (
    <Image
      key={intento}
      source={{ uri, headers: { Authorization: `Bearer ${token}` } }}
      style={[style, { backgroundColor: colores.linea }]}
      resizeMode={resizeMode}
      onError={() => {
        if (intento === 0) cliente.get('/auth/me/').catch(() => {}).finally(() => setIntento(1));
      }}
    />
  );
}
