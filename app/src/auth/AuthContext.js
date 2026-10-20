import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { cliente, registrarExpiracion } from '../api/cliente';
import { borrarTokens, guardarTokens, leerAccess } from '../api/sesion';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cerrarSesion = useCallback(async () => {
    await borrarTokens();
    setUsuario(null);
  }, []);

  // Al abrir la app: si hay token guardado, se recupera el perfil.
  useEffect(() => {
    registrarExpiracion(() => setUsuario(null));
    (async () => {
      try {
        if (await leerAccess()) {
          const { data } = await cliente.get('/auth/me/');
          setUsuario(data);
        }
      } catch {
        // Sin conexión o sesión vencida: se muestra el login.
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const iniciarSesion = useCallback(async (username, password) => {
    const { data } = await cliente.post('/auth/login/', { username, password });
    await guardarTokens(data);
    setUsuario(data.usuario);
  }, []);

  const valor = useMemo(
    () => ({ usuario, cargando, iniciarSesion, cerrarSesion }),
    [usuario, cargando, iniciarSesion, cerrarSesion],
  );
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
