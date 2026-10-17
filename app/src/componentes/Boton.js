import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

export default function Boton({ titulo, onPress, cargando = false, variante = 'primario' }) {
  const secundario = variante === 'secundario';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={cargando}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        secundario ? styles.secundario : styles.primario,
        pressed && { opacity: 0.85 },
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={secundario ? colores.rojo : colores.tinta} />
      ) : (
        <Text style={[styles.texto, secundario && { color: colores.rojo }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: espacio.l },
  primario: { backgroundColor: colores.ocre },
  secundario: { borderWidth: 2, borderColor: colores.rojo },
  texto: { fontFamily: fuentes.textoNegrita, fontSize: 16, color: colores.tinta },
});
