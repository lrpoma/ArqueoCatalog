const dos = (n) => String(n).padStart(2, '0');

export function formatearFecha(iso) {
  const f = new Date(iso);
  if (Number.isNaN(f.getTime())) return '';
  return `${dos(f.getDate())}/${dos(f.getMonth() + 1)}/${f.getFullYear()} ${dos(f.getHours())}:${dos(f.getMinutes())}`;
}

// Acepta coma o punto decimal. Devuelve NaN si no es un número.
export const aNumero = (texto) => Number(String(texto).trim().replace(',', '.'));

export const metros = (n) => `${Number(n).toFixed(2).replace(/\.?0+$/, '')} m`;
