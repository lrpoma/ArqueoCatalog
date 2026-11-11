import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

export default function Campo({ etiqueta, error, multilinea = false, ...props }) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        placeholderTextColor={colores.tintaSuave}
        multiline={multilinea}
        textAlignVertical={multilinea ? 'top' : 'center'}
        style={[styles.entrada, multilinea && styles.multilinea, error && styles.entradaError]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: espacio.m },
  etiqueta: { fontFamily: fuentes.textoMedio, fontSize: 14, color: colores.tintaSuave, marginBottom: espacio.xs },
  entrada: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colores.linea,
    borderRadius: 12,
    backgroundColor: colores.blanco,
    paddingHorizontal: espacio.m,
    fontFamily: fuentes.texto,
    fontSize: 16,
    color: colores.tinta,
  },
  multilinea: { minHeight: 96, paddingTop: espacio.s },
  entradaError: { borderColor: colores.rojo },
  error: { fontFamily: fuentes.texto, fontSize: 13, color: colores.rojo, marginTop: espacio.xs },
});
