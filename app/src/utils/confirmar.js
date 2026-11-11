import { Alert } from 'react-native';

// Confirmación antes de una acción destructiva (desactivar).
export function confirmar({ titulo, mensaje, accion, alConfirmar }) {
  Alert.alert(titulo, mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: accion, style: 'destructive', onPress: alConfirmar },
  ]);
}
