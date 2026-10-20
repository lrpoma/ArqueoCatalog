import { StyleSheet, Text, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

export default function Fila({ etiqueta, valor }) {
  if (valor == null || valor === '') return null;
  return (
    <View style={styles.fila}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: { marginBottom: espacio.m },
  etiqueta: { fontFamily: fuentes.textoMedio, fontSize: 12, color: colores.tintaSuave, textTransform: 'uppercase', letterSpacing: 0.5 },
  valor: { fontFamily: fuentes.texto, fontSize: 16, color: colores.tinta, marginTop: 2 },
});
