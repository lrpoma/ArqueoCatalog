import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { mensajeDeError } from '../api/cliente';
import { useAuth } from '../auth/AuthContext';
import Boton from '../componentes/Boton';
import Escalon from '../componentes/Escalon';
import { colores, espacio, fuentes } from '../tema';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar() {
    if (!username.trim() || !password) {
      setError('Escribe tu usuario y contraseña.');
      return;
    }
    setError('');
    setCargando(true);
    try {
      await iniciarSesion(username.trim(), password);
    } catch (e) {
      setError(mensajeDeError(e));
      setCargando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.contenedor} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.cabecera}>
          <Text style={styles.titulo}>ArqueoCatalog</Text>
          <Text style={styles.subtitulo}>Cada hallazgo, con su historia</Text>
        </View>
        <Escalon />
        <View style={styles.formulario}>
          <Text style={styles.etiqueta}>Usuario</Text>
          <TextInput
            style={styles.campo}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="username"
            returnKeyType="next"
          />
          <Text style={styles.etiqueta}>Contraseña</Text>
          <TextInput
            style={styles.campo}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            onSubmitEditing={entrar}
          />
          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
          <View style={{ marginTop: espacio.l }}>
            <Boton titulo="Iniciar sesión" onPress={entrar} cargando={cargando} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.hueso },
  cabecera: { backgroundColor: colores.rojo, padding: espacio.l, paddingTop: 72, paddingBottom: espacio.xl },
  titulo: { fontFamily: fuentes.titulo, fontSize: 38, color: colores.blanco },
  subtitulo: { fontFamily: fuentes.texto, fontSize: 16, color: '#FBE9E7', marginTop: espacio.s },
  formulario: { padding: espacio.l },
  etiqueta: { fontFamily: fuentes.textoMedio, fontSize: 14, color: colores.tintaSuave, marginBottom: espacio.xs, marginTop: espacio.m },
  campo: {
    backgroundColor: colores.blanco,
    borderWidth: 1,
    borderColor: colores.linea,
    borderRadius: 8,
    paddingHorizontal: espacio.m,
    minHeight: 48,
    fontFamily: fuentes.texto,
    fontSize: 16,
    color: colores.tinta,
  },
  error: { fontFamily: fuentes.textoMedio, color: colores.rojo, marginTop: espacio.m },
});
