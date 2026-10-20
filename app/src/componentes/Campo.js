import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

export default function Campo({ etiqueta, multilinea = false, ...props }) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.tintaSuave}
        multiline={multilinea}
        style={[styles.campo, multilinea && { minHeight: 96, textAlignVertical: 'top' }]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: { marginBottom: espacio.m },
  etiqueta: { fontFamily: fuentes.textoMedio, fontSize: 14, color: colores.tintaSuave, marginBottom: espacio.xs },
  campo: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 8,
    paddingHorizontal: espacio.m,
    paddingVertical: 12,
    fontFamily: fuentes.texto,
    fontSize: 16,
    color: colores.tinta,
  },
});
