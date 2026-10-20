import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

import { cliente, mensajeDeGuardado } from '../api/cliente';

// Un registro por su ruta; se recarga al volver a la pantalla (por ejemplo, tras editarlo).
export default function useRegistro(ruta) {
  const [dato, setDato] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      const { data } = await cliente.get(ruta);
      setDato(data);
      setError('');
    } catch (e) {
      setError(mensajeDeGuardado(e));
    }
  }, [ruta]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  return { dato, error, recargar: cargar };
}
