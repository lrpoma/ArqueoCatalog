import { useEffect, useState } from 'react';
import { Image } from 'react-native';

import { urlAbsoluta } from '../api/config';
import { leerAccess } from '../api/sesion';

// Las fotos y el QR exigen el JWT, así que se piden con el encabezado Authorization.
export default function ImagenProtegida({ ruta, style, ...props }) {
  const [access, setAccess] = useState(null);
  useEffect(() => {
    leerAccess().then(setAccess);
  }, [ruta]);
  if (!access) return null;
  return <Image source={{ uri: urlAbsoluta(ruta), headers: { Authorization: `Bearer ${access}` } }} style={style} {...props} />;
}
