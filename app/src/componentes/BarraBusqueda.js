import { StyleSheet, TextInput, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

export default function BarraBusqueda({ valor, onChange, placeholder }) {
  return (
    <View style={styles.barra}>
      <TextInput
        accessibilityLabel="Buscar"
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colores.tintaSuave}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
        style={styles.campo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  barra: { padding: espacio.m, paddingBottom: 0 },
  campo: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 999,
    paddingHorizontal: espacio.m,
    paddingVertical: 10,
    fontFamily: fuentes.texto,
    fontSize: 16,
    color: colores.tinta,
  },
});
