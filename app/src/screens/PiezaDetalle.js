import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';

import { cliente, mensajeDeGuardado } from '../api/cliente';
import { confirmarDesactivar, Fila as Acciones, useEsAdministrador } from '../componentes/Acciones';
import Boton from '../componentes/Boton';
import FilaDato from '../componentes/Fila';
import ImagenProtegida from '../componentes/ImagenProtegida';
import { useCatalogos } from '../catalogos/CatalogosContext';
import useRegistro from '../hooks/useRegistro';
import { colores, espacio, fuentes } from '../tema';

const LADO_MAXIMO = 1600;

// Reduce la foto en el celular antes de subirla; el servidor además le quita el EXIF.
async function prepararFoto(uri) {
  const { uri: reducida } = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: LADO_MAXIMO } }], {
    compress: 0.8,
    format: ImageManipulator.SaveFormat.JPEG,
  });
  return reducida;
}

export default function PiezaDetalle({ navigation, route }) {
  const { id } = route.params;
  const esAdmin = useEsAdministrador();
  const { tipos, periodos, etiquetas } = useCatalogos();
  const { dato: p, error, recargar } = useRegistro(`/piezas/${id}/`);
  const [subiendo, setSubiendo] = useState(false);

  if (!p) return <Text style={styles.aviso}>{error || 'Cargando…'}</Text>;

  async function subir(resultado) {
    if (resultado.canceled) return;
    setSubiendo(true);
    try {
      const uri = await prepararFoto(resultado.assets[0].uri);
      const formulario = new FormData();
      formulario.append('archivo', { uri, name: 'foto.jpg', type: 'image/jpeg' });
      await cliente.post(`/piezas/${id}/fotos/`, formulario, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      await recargar();
    } catch (e) {
      Alert.alert('No se pudo subir la foto', mensajeDeGuardado(e));
    } finally {
      setSubiendo(false);
    }
  }

  async function tomarFoto() {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Permite el acceso a la cámara para fotografiar la pieza.');
      return;
    }
    subir(await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 }));
  }

  async function elegirDeGaleria() {
    subir(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 }));
  }

  return (
    <ScrollView style={{ backgroundColor: colores.hueso }} contentContainerStyle={styles.contenido}>
      <Text style={styles.codigo}>{p.codigo}</Text>
      <Text style={styles.nombre}>{p.nombre}</Text>

      {p.fotografias.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: espacio.m }}>
          {p.fotografias.map((f) => (
            <ImagenProtegida key={f.id} ruta={f.url_miniatura} style={styles.foto} />
          ))}
        </ScrollView>
      )}
      <Acciones>
        <Boton titulo="Tomar foto" onPress={tomarFoto} cargando={subiendo} />
        <Boton variante="secundario" titulo="Elegir de la galería" onPress={elegirDeGaleria} cargando={subiendo} />
      </Acciones>

      <FilaDato etiqueta="Procedencia" valor={`${p.yacimiento_nombre}, capa ${p.capa_codigo}`} />
      <FilaDato etiqueta="Tipo" valor={tipos.find((t) => t.id === p.tipo_pieza)?.nombre} />
      <FilaDato etiqueta="Periodo cultural" valor={periodos.find((x) => x.id === p.periodo_cultural)?.nombre} />
      <FilaDato etiqueta="Etiqueta" valor={etiquetas.find((e) => e.id === p.etiqueta)?.nombre} />
      <FilaDato etiqueta="Material" valor={p.material} />
      <FilaDato etiqueta="Descripción" valor={p.descripcion} />
      <FilaDato etiqueta="Ficha pública" valor={p.publica ? 'Visible con el QR' : 'Restringida'} />

      <Acciones>
        <Boton titulo="Ver código QR" onPress={() => navigation.navigate('QrPieza', { id, codigo: p.codigo })} />
        <Boton variante="secundario" titulo="Ver historial de cambios" onPress={() => navigation.navigate('HistorialPieza', { id })} />
        <Boton variante="secundario" titulo="Editar pieza" onPress={() => navigation.navigate('PiezaForm', { pieza: p })} />
        {esAdmin && (
          <Boton
            variante="secundario"
            titulo="Desactivar pieza"
            onPress={() => confirmarDesactivar({ ruta: `/piezas/${id}/`, nombre: p.codigo, alTerminar: navigation.goBack })}
          />
        )}
      </Acciones>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  aviso: { fontFamily: fuentes.texto, padding: espacio.l, color: colores.tintaSuave },
  contenido: { padding: espacio.m, paddingBottom: espacio.xl },
  codigo: { fontFamily: fuentes.textoNegrita, fontSize: 13, color: colores.rojo, letterSpacing: 0.5 },
  nombre: { fontFamily: fuentes.titulo, fontSize: 28, color: colores.tinta, marginBottom: espacio.m },
  foto: { width: 160, height: 160, borderRadius: 8, marginRight: espacio.s, backgroundColor: colores.linea },
});
