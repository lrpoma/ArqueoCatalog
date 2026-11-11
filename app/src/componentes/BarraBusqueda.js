import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

// Búsqueda de texto con espera de 400 ms para no consultar en cada tecla.
export default function BarraBusqueda({ placeholder, onBuscar }) {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    const temporizador = setTimeout(() => onBuscar(texto.trim()), 400);
    return () => clearTimeout(temporizador);
  }, [texto, onBuscar]);

  return (
    <View style={styles.contenedor}>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder={placeholder}
        placeholderTextColor={colores.tintaSuave}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.entrada}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { padding: espacio.m, paddingBottom: espacio.s, backgroundColor: colores.hueso },
  entrada: {
    minHeight: 44,
    borderRadius: 999,
    backgroundColor: colores.blanco,
    borderWidth: 1.5,
    borderColor: colores.linea,
    paddingHorizontal: espacio.m,
    fontFamily: fuentes.texto,
    fontSize: 16,
    color: colores.tinta,
  },
});
