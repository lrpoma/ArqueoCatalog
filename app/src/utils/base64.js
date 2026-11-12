const TABLA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// ArrayBuffer -> base64. Se implementa a mano para no depender de Buffer ni de btoa en Hermes.
export function aBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const partes = [];
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    partes.push(TABLA[(n >> 18) & 63] + TABLA[(n >> 12) & 63] + TABLA[(n >> 6) & 63] + TABLA[n & 63]);
  }
  const resto = bytes.length - i;
  if (resto === 1) {
    const n = bytes[i] << 16;
    partes.push(`${TABLA[(n >> 18) & 63]}${TABLA[(n >> 12) & 63]}==`);
  } else if (resto === 2) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8);
    partes.push(`${TABLA[(n >> 18) & 63]}${TABLA[(n >> 12) & 63]}${TABLA[(n >> 6) & 63]}=`);
  }
  return partes.join('');
}
