import { StyleSheet, Text, View } from 'react-native';

import Escalon from '../componentes/Escalon';
import { colores, espacio, fuentes } from '../tema';

export default function PantallaBase({ titulo, descripcion }) {
  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{descripcion}</Text>
      </View>
      <Escalon />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.hueso },
  cabecera: { backgroundColor: colores.rojo, padding: espacio.l, paddingTop: espacio.xl },
  titulo: { fontFamily: fuentes.titulo, fontSize: 32, color: colores.blanco, marginBottom: espacio.s },
  descripcion: { fontFamily: fuentes.texto, fontSize: 15, lineHeight: 22, color: '#FBE9E7' },
});
