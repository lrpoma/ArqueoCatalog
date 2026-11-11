import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { cliente } from '../api/cliente';

const CatalogosContext = createContext(null);

export const ESTADOS_YACIMIENTO = [
  { id: 'en_exploracion', nombre: 'En exploración' },
  { id: 'en_excavacion', nombre: 'En excavación' },
  { id: 'en_estudio', nombre: 'En estudio' },
  { id: 'cerrado', nombre: 'Cerrado' },
];

// Catálogos de solo lectura (periodos, tipos, etiquetas): se piden una vez al iniciar sesión
// y alimentan los selectores de los formularios y los nombres que se muestran en las listas.
export function CatalogosProvider({ children }) {
  const [datos, setDatos] = useState({ periodos: [], tipos: [], etiquetas: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    Promise.all([
      cliente.get('/catalogos/periodos/'),
      cliente.get('/catalogos/tipos/'),
      cliente.get('/catalogos/etiquetas/'),
    ])
      .then(([periodos, tipos, etiquetas]) => {
        if (!vigente) return;
        setDatos({ periodos: periodos.data, tipos: tipos.data, etiquetas: etiquetas.data });
        setError(false);
      })
      .catch(() => vigente && setError(true))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [intento]);

  const recargar = useCallback(() => {
    setCargando(true);
    setIntento((n) => n + 1);
  }, []);

  const valor = useMemo(() => {
    const nombreDe = (lista, id) => lista.find((x) => x.id === id)?.nombre ?? '';
    return {
      ...datos,
      cargando,
      error,
      recargar,
      nombrePeriodo: (id) => nombreDe(datos.periodos, id),
      nombreTipo: (id) => nombreDe(datos.tipos, id),
      nombreEtiqueta: (id) => nombreDe(datos.etiquetas, id),
      nombreEstado: (id) => nombreDe(ESTADOS_YACIMIENTO, id),
    };
  }, [datos, cargando, error, recargar]);

  return <CatalogosContext.Provider value={valor}>{children}</CatalogosContext.Provider>;
}

export const useCatalogos = () => useContext(CatalogosContext);
