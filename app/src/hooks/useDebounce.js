import { useEffect, useState } from 'react';

// Evita pedir al servidor en cada tecla mientras se escribe.
export default function useDebounce(valor, ms = 400) {
  const [retrasado, setRetrasado] = useState(valor);
  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), ms);
    return () => clearTimeout(temporizador);
  }, [valor, ms]);
  return retrasado;
}
