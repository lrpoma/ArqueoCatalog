import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { cliente } from '../api/cliente';

const LADO_MAXIMO = 1600; // px; el servidor acepta hasta 5 MB y reduce a 2048

// Abre la cámara o la galería. Devuelve la uri local o null si se cancela / se niega el permiso.
export async function elegirFoto(origen) {
  if (origen === 'camara') {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) throw new Error('permiso');
  }
  const opciones = { mediaTypes: ['images'], quality: 1 };
  const resultado =
    origen === 'camara'
      ? await ImagePicker.launchCameraAsync(opciones)
      : await ImagePicker.launchImageLibraryAsync(opciones);
  return resultado.canceled ? null : resultado.assets[0];
}

// Se redimensiona y comprime antes de subir (ahorra datos en campo). Solo se reduce, nunca se amplía.
export async function prepararFoto(asset) {
  const contexto = ImageManipulator.manipulate(asset.uri);
  const mayor = Math.max(asset.width ?? 0, asset.height ?? 0);
  if (mayor > LADO_MAXIMO) {
    contexto.resize(asset.width >= asset.height ? { width: LADO_MAXIMO } : { height: LADO_MAXIMO });
  }
  const imagen = await contexto.renderAsync();
  return imagen.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
}

export async function subirFoto(piezaId, asset) {
  const lista = await prepararFoto(asset);
  const formulario = new FormData();
  formulario.append('archivo', { uri: lista.uri, name: 'foto.jpg', type: 'image/jpeg' });
  const { data } = await cliente.post(`/piezas/${piezaId}/fotos/`, formulario, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}
