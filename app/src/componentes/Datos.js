import { StyleSheet, Text, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

export function Dato({ etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor || 'Sin dato'}</Text>
    </View>
  );
}

export function Seccion({ titulo, children }) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.tituloSeccion}>{titulo}</Text>
      {children}
    </View>
  );
}

export function Etiquetita({ texto, color = colores.rojo }) {
  return (
    <View style={[styles.chip, { borderColor: color }]}>
      <Text style={[styles.textoChip, { color }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dato: { marginBottom: espacio.m },
  etiqueta: { fontFamily: fuentes.texto, fontSize: 13, color: colores.tintaSuave },
  valor: { fontFamily: fuentes.textoMedio, fontSize: 17, color: colores.tinta },
  seccion: { marginTop: espacio.l },
  tituloSeccion: { fontFamily: fuentes.titulo, fontSize: 22, color: colores.tinta, marginBottom: espacio.s },
  chip: { alignSelf: 'flex-start', borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 },
  textoChip: { fontFamily: fuentes.textoMedio, fontSize: 12 },
});
