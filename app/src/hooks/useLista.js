import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

import { cliente, mensajeDeGuardado } from '../api/cliente';

// Lista paginada (20 por página). Se recarga al volver a la pantalla, para ver los cambios hechos en otra.
export default function useLista(ruta, params = {}) {
  const [datos, setDatos] = useState([]);
  const [siguiente, setSiguiente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const ultima = useRef(0);
  const clave = JSON.stringify(params);

  const cargar = useCallback(async () => {
    const turno = ++ultima.current;
    setError('');
    try {
      const { data } = await cliente.get(ruta, { params: JSON.parse(clave) });
      if (turno !== ultima.current) return;
      setDatos(data.results);
      setSiguiente(data.next);
    } catch (e) {
      if (turno === ultima.current) setError(mensajeDeGuardado(e));
    } finally {
      if (turno === ultima.current) setCargando(false);
    }
  }, [ruta, clave]);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar]),
  );

  const cargarMas = useCallback(async () => {
    if (!siguiente) return;
    const turno = ultima.current;
    try {
      const { data } = await cliente.get(siguiente);
      if (turno !== ultima.current) return;
      setDatos((previos) => [...previos, ...data.results]);
      setSiguiente(data.next);
    } catch (e) {
      setError(mensajeDeGuardado(e));
    }
  }, [siguiente]);

  return { datos, cargando, error, recargar: cargar, cargarMas };
}
