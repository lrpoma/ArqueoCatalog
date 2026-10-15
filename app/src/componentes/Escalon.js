import { View } from 'react-native';

import { colores } from '../tema';

// Patrón escalonado andino (el mismo de la web), hecho con bloques para no añadir dependencias.
const PASO = 8;
const PATRON = [1, 2, 3, 3, 2, 1]; // alturas en pasos

export default function Escalon({ fondo = colores.rojo, color = colores.ocre, repeticiones = 14 }) {
  const bloques = Array.from({ length: repeticiones }, () => PATRON).flat();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ flexDirection: 'row', alignItems: 'flex-end', height: PASO * 3, backgroundColor: fondo, overflow: 'hidden' }}
    >
      {bloques.map((alto, i) => (
        <View key={i} style={{ width: PASO, height: alto * PASO, backgroundColor: color }} />
      ))}
    </View>
  );
}
