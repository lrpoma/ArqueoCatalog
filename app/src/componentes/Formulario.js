import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';
import Boton from './Boton';

export default function Formulario({ children, onGuardar, guardando, error, textoBoton = 'Guardar' }) {
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colores.hueso }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.contenido}>
        {children}
        {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
        <View style={{ marginTop: espacio.m }}>
          <Boton titulo={textoBoton} onPress={onGuardar} cargando={guardando} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: espacio.m, paddingBottom: espacio.xl },
  error: { fontFamily: fuentes.textoMedio, fontSize: 14, color: colores.rojo, marginTop: espacio.s },
});
