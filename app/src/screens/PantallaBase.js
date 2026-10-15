import { StyleSheet, Text, View } from 'react-native';

export default function PantallaBase({ titulo, descripcion }) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descripcion}>{descripcion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  descripcion: { fontSize: 14, color: '#555', textAlign: 'center' },
});
