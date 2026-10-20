import { Alert, StyleSheet, View } from 'react-native';

import { cliente, mensajeDeGuardado } from '../api/cliente';
import { useAuth } from '../auth/AuthContext';
import { espacio } from '../tema';

// DELETE es eliminación lógica y solo el Administrador puede hacerla; la UI lo refleja, el backend lo exige.
export function useEsAdministrador() {
  return useAuth().usuario?.rol === 'administrador';
}

export function confirmarDesactivar({ ruta, nombre, alTerminar }) {
  Alert.alert('Desactivar', `¿Desactivar ${nombre}? Dejará de verse en la app, pero no se borra.`, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Desactivar',
      style: 'destructive',
      onPress: async () => {
        try {
          await cliente.delete(ruta);
          alTerminar();
        } catch (e) {
          Alert.alert('No se pudo desactivar', mensajeDeGuardado(e));
        }
      },
    },
  ]);
}

export function Fila({ children }) {
  return <View style={styles.fila}>{children}</View>;
}

const styles = StyleSheet.create({
  fila: { gap: espacio.s, marginBottom: espacio.m },
});
