import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

import { cliente } from '../api/cliente';

// Lista paginada del API (`?page=n`). Recarga la primera página al volver a la pantalla,
// así los cambios hechos en un formulario o detalle se reflejan sin recargar a mano.
export function useLista(ruta, params = {}) {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState(false);
  const pagina = useRef(1);
  const hayMas = useRef(false);
  const cargandoMas = useRef(false);
  const peticion = useRef(0); // descarta respuestas de una consulta anterior (p. ej. búsqueda vieja)
  const clave = JSON.stringify([ruta, params]);

  const cargar = useCallback(
    async (numero) => {
      const mia = ++peticion.current;
      try {
        const { data } = await cliente.get(ruta, { params: { ...params, page: numero } });
        if (mia !== peticion.current) return;
        pagina.current = numero;
        hayMas.current = Boolean(data.next);
        setItems((previos) => (numero === 1 ? data.results : [...previos, ...data.results]));
        setError(false);
      } catch {
        if (mia === peticion.current) setError(true);
      } finally {
        if (mia === peticion.current) {
          setCargando(false);
          setRefrescando(false);
          cargandoMas.current = false;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clave],
  );

  useFocusEffect(
    useCallback(() => {
      cargar(1);
    }, [cargar]),
  );

  const refrescar = useCallback(() => {
    setRefrescando(true);
    cargar(1);
  }, [cargar]);

  const cargarMas = useCallback(() => {
    if (!hayMas.current || cargandoMas.current) return;
    cargandoMas.current = true;
    cargar(pagina.current + 1);
  }, [cargar]);

  const reintentar = useCallback(() => {
    setCargando(true);
    cargar(1);
  }, [cargar]);

  return { items, cargando, refrescando, error, refrescar, cargarMas, reintentar };
}

// Trae todas las páginas (para selectores: yacimientos, capas). Con tope por seguridad.
export async function listarTodo(ruta, params = {}, maxPaginas = 10) {
  const todos = [];
  for (let pagina = 1; pagina <= maxPaginas; pagina++) {
    const { data } = await cliente.get(ruta, { params: { ...params, page: pagina } });
    todos.push(...data.results);
    if (!data.next) break;
  }
  return todos;
}
