import { StyleSheet, Text, View } from 'react-native';

import ImagenProtegida from '../componentes/ImagenProtegida';
import { colores, espacio, fuentes } from '../tema';

// El QR lo genera el backend; la app solo lo muestra.
export default function QrPieza({ route }) {
  const { id, codigo } = route.params;
  return (
    <View style={styles.contenedor}>
      <View style={styles.marco}>
        <ImagenProtegida ruta={`/api/v1/piezas/${id}/qr/`} style={styles.qr} />
      </View>
      <Text style={styles.codigo}>{codigo}</Text>
      <Text style={styles.ayuda}>Al escanearlo se abre la ficha pública de la pieza, si está marcada como pública.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', padding: espacio.l, backgroundColor: colores.hueso },
  marco: { backgroundColor: colores.blanco, padding: espacio.m, borderRadius: 12, borderWidth: 1, borderColor: colores.linea },
  qr: { width: 280, height: 280 },
  codigo: { fontFamily: fuentes.titulo, fontSize: 26, color: colores.tinta, marginTop: espacio.l },
  ayuda: { fontFamily: fuentes.texto, fontSize: 14, color: colores.tintaSuave, textAlign: 'center', marginTop: espacio.s },
});
