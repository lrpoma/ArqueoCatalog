import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

export default function BotonFlotante({ titulo, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.boton, pressed && { opacity: 0.85 }]}>
      <Text style={styles.texto}>+ {titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    position: 'absolute',
    right: espacio.m,
    bottom: espacio.m,
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: colores.ocre,
    paddingHorizontal: espacio.l,
    justifyContent: 'center',
    elevation: 4,
  },
  texto: { fontFamily: fuentes.textoNegrita, fontSize: 16, color: colores.tinta },
});
