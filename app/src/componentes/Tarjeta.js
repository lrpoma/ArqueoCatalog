import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

export default function Tarjeta({ titulo, detalle, etiqueta, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.tarjeta, pressed && { opacity: 0.85 }]}
    >
      <View style={{ flex: 1 }}>
        {etiqueta ? <Text style={styles.etiqueta}>{etiqueta}</Text> : null}
        <Text style={styles.titulo}>{titulo}</Text>
        {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
      </View>
      <Text style={styles.flecha}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 10,
    padding: espacio.m,
    marginBottom: espacio.s,
  },
  etiqueta: { fontFamily: fuentes.textoNegrita, fontSize: 12, color: colores.rojo, letterSpacing: 0.5 },
  titulo: { fontFamily: fuentes.textoNegrita, fontSize: 16, color: colores.tinta },
  detalle: { fontFamily: fuentes.texto, fontSize: 14, color: colores.tintaSuave, marginTop: 2 },
  flecha: { fontSize: 28, color: colores.tintaSuave, marginLeft: espacio.s },
});
