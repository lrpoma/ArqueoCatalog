import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';

import Perfil from './src/screens/Perfil';
import Piezas from './src/screens/Piezas';
import Yacimientos from './src/screens/Yacimientos';
import { colores, fuentes } from './src/tema';

const Tab = createBottomTabNavigator();

const temaNavegacion = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colores.rojo,
    background: colores.hueso,
    card: colores.blanco,
    text: colores.tinta,
    border: colores.linea,
  },
};

export default function App() {
  const [cargadas] = useFonts({ Fraunces_600SemiBold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  if (!cargadas) return null;

  return (
    <NavigationContainer theme={temaNavegacion}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colores.rojo,
          tabBarInactiveTintColor: colores.tintaSuave,
          tabBarLabelStyle: { fontFamily: fuentes.textoMedio, fontSize: 12 },
          tabBarStyle: { borderTopColor: colores.linea },
        }}
      >
        <Tab.Screen name="Yacimientos" component={Yacimientos} />
        <Tab.Screen name="Piezas" component={Piezas} />
        <Tab.Screen name="Perfil" component={Perfil} />
      </Tab.Navigator>
      <StatusBar style="light" backgroundColor={colores.rojo} />
    </NavigationContainer>
  );
}
