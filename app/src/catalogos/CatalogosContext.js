import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { cliente } from '../api/cliente';

const CatalogosContext = createContext({ periodos: [], tipos: [], etiquetas: [], listos: false });

// Los catálogos se editan solo en el panel admin; la app los descarga una vez y los usa en los selectores.
export function CatalogosProvider({ children }) {
  const [catalogos, setCatalogos] = useState({ periodos: [], tipos: [], etiquetas: [], listos: false });

  useEffect(() => {
    (async () => {
      try {
        const [periodos, tipos, etiquetas] = await Promise.all([
          cliente.get('/catalogos/periodos/'),
          cliente.get('/catalogos/tipos/'),
          cliente.get('/catalogos/etiquetas/'),
        ]);
        setCatalogos({ periodos: periodos.data, tipos: tipos.data, etiquetas: etiquetas.data, listos: true });
      } catch {
        // Sin catálogos los formularios no pueden guardar; se reintenta al reabrir la app.
      }
    })();
  }, []);

  const valor = useMemo(() => catalogos, [catalogos]);
  return <CatalogosContext.Provider value={valor}>{children}</CatalogosContext.Provider>;
}

export const useCatalogos = () => useContext(CatalogosContext);
