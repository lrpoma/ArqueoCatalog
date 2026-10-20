import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

// Elección de un valor de catálogo con chips. Los catálogos son cortos, así que no hace falta un modal.
export default function Selector({ etiqueta, opciones, valor, onChange, opcional = false, claveTexto = 'nombre' }) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <View style={styles.chips}>
        {opcional && (
          <Chip texto="Ninguna" activo={valor == null} onPress={() => onChange(null)} />
        )}
        {opciones.map((o) => (
          <Chip key={o.id ?? o.valor} texto={o[claveTexto] ?? o.texto} activo={valor === (o.id ?? o.valor)} onPress={() => onChange(o.id ?? o.valor)} />
        ))}
        {opciones.length === 0 && <Text style={styles.vacio}>Sin opciones disponibles</Text>}
      </View>
    </View>
  );
}

function Chip({ texto, activo, onPress }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: activo }}
      onPress={onPress}
      style={[styles.chip, activo && styles.chipActivo]}
    >
      <Text style={[styles.chipTexto, activo && { color: colores.blanco }]}>{texto}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grupo: { marginBottom: espacio.m },
  etiqueta: { fontFamily: fuentes.textoMedio, fontSize: 14, color: colores.tintaSuave, marginBottom: espacio.s },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espacio.s },
  chip: { borderWidth: 1, borderColor: colores.linea, backgroundColor: colores.blanco, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 },
  chipActivo: { backgroundColor: colores.rojo, borderColor: colores.rojo },
  chipTexto: { fontFamily: fuentes.textoMedio, fontSize: 14, color: colores.tinta },
  vacio: { fontFamily: fuentes.texto, color: colores.tintaSuave },
});
