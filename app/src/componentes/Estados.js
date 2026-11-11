import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';
import Boton from './Boton';

export function Cargando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colores.rojo} />
    </View>
  );
}

export function Vacio({ texto }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

export function ErrorReintento({ texto = 'No se pudo cargar. Revisa tu conexión.', onReintentar }) {
  return (
    <View style={styles.centro}>
      <Text style={styles.texto}>{texto}</Text>
      {onReintentar ? (
        <View style={{ marginTop: espacio.m }}>
          <Boton titulo="Reintentar" variante="secundario" onPress={onReintentar} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espacio.l },
  texto: { fontFamily: fuentes.texto, fontSize: 16, lineHeight: 22, color: colores.tintaSuave, textAlign: 'center' },
});
