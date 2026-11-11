import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

// Botón flotante de acción principal (crear).
export default function Fab({ titulo, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
    >
      <Text style={styles.texto}>+ {titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: espacio.m,
    bottom: espacio.m,
    minHeight: 52,
    borderRadius: 999,
    paddingHorizontal: espacio.l,
    backgroundColor: colores.ocre,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  texto: { fontFamily: fuentes.textoNegrita, fontSize: 16, color: colores.tinta },
});
