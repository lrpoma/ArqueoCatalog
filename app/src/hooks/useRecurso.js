import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

import { cliente } from '../api/cliente';

// Un solo registro (detalle). Se recarga al volver a la pantalla, p. ej. tras editarlo.
export function useRecurso(ruta) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null); // null | 'noEncontrado' | 'red'
  const peticion = useRef(0);

  const cargar = useCallback(async () => {
    const mia = ++peticion.current;
    try {
      const { data } = await cliente.get(ruta);
      if (mia !== peticion.current) return;
      setDatos(data);
      setError(null);
    } catch (e) {
      if (mia === peticion.current) setError(e.response?.status === 404 ? 'noEncontrado' : 'red');
    } finally {
      if (mia === peticion.current) setCargando(false);
    }
  }, [ruta]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  return { datos, cargando, error, recargar: cargar };
}
