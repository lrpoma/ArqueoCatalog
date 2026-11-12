import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { cliente } from '../api/cliente';
import { colores, fuentes } from '../tema';
import { aBase64 } from '../utils/base64';

// Las fotos y el QR exigen sesión (/media/{id}/, /piezas/{id}/qr/). En vez de pasar el JWT como cabecera del
// <Image> (en Android no siempre llega), se descargan con el cliente HTTP de la app, que ya renueva el token
// solo, y se muestran como data URI. Se guardan en memoria para no repetir descargas al desplazar listas.
const LIMITE_CACHE = 8_000_000; // caracteres base64 (~6 MB de imágenes)
const cache = new Map(); // uri -> data URI, en orden de inserción
let tamano = 0;

function guardar(uri, dataUri) {
  if (cache.has(uri)) return;
  cache.set(uri, dataUri);
  tamano += dataUri.length;
  for (const [clave, valor] of cache) {
    if (tamano <= LIMITE_CACHE || clave === uri) break;
    cache.delete(clave);
    tamano -= valor.length;
  }
}

// Motivo breve del fallo, visible en el recuadro: ayuda a diagnosticar sin necesidad de logs.
function motivo(error) {
  if (error?.response) return `Error ${error.response.status}`;
  return error?.code === 'ECONNABORTED' ? 'Tiempo agotado' : 'Sin conexión';
}

// Al cerrar sesión no deben quedar imágenes en memoria que otra persona pueda ver.
export function vaciarCacheFotos() {
  cache.clear();
  tamano = 0;
}

export default function FotoProtegida({ uri, style, resizeMode = 'cover' }) {
  const [estado, setEstado] = useState({ uri: null, fallo: null }); // fallo: texto del motivo

  useEffect(() => {
    if (cache.has(uri)) return;
    let vigente = true;
    cliente
      .get(uri, { responseType: 'arraybuffer', timeout: 30000 })
      .then(({ data, headers }) => {
        const tipo = String(headers['content-type'] ?? 'image/jpeg').split(';')[0];
        guardar(uri, `data:${tipo};base64,${aBase64(data)}`);
        if (vigente) setEstado({ uri, fallo: null });
      })
      .catch((e) => vigente && setEstado({ uri, fallo: motivo(e) }));
    return () => {
      vigente = false;
    };
  }, [uri]);

  const imagen = cache.get(uri);
  if (imagen) return <Image source={{ uri: imagen }} style={style} resizeMode={resizeMode} />;

  const fallo = estado.uri === uri ? estado.fallo : null;
  return (
    <View style={[style, styles.vacio]}>
      {fallo ? <Text style={styles.texto}>No se pudo cargar la imagen ({fallo})</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  vacio: { backgroundColor: colores.linea, alignItems: 'center', justifyContent: 'center', padding: 4 },
  texto: { fontFamily: fuentes.texto, fontSize: 11, color: colores.tintaSuave, textAlign: 'center' },
});
