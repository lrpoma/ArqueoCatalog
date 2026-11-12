import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { CatalogosProvider } from './src/catalogos/CatalogosContext';
import { PilaPiezas, PilaYacimientos } from './src/navegacion/Pilas';
import Login from './src/screens/Login';
import Perfil from './src/screens/Perfil';
import { colores, fuentes } from './src/tema';

const Tab = createBottomTabNavigator();

const ICONOS = {
  Yacimientos: ['map', 'map-outline'],
  Piezas: ['cube', 'cube-outline'],
  Perfil: ['person', 'person-outline'],
};

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

function Principal() {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  if (!usuario) return <Login />;

  return (
    <CatalogosProvider>
      <NavigationContainer theme={temaNavegacion}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={ICONOS[route.name][focused ? 0 : 1]} size={size} color={color} />
            ),
            tabBarActiveTintColor: colores.rojo,
            tabBarInactiveTintColor: colores.tintaSuave,
            tabBarLabelStyle: { fontFamily: fuentes.textoMedio, fontSize: 12 },
            tabBarStyle: { borderTopColor: colores.linea },
          })}
        >
          <Tab.Screen name="Yacimientos" component={PilaYacimientos} />
          <Tab.Screen name="Piezas" component={PilaPiezas} />
          <Tab.Screen name="Perfil" component={Perfil} />
        </Tab.Navigator>
      </NavigationContainer>
    </CatalogosProvider>
  );
}

export default function App() {
  const [cargadas] = useFonts({
    Fraunces_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    ...Ionicons.font, // se precarga para que los íconos no parpadeen
  });
  if (!cargadas) return null;

  return (
    <AuthProvider>
      <Principal />
      <StatusBar style="light" backgroundColor={colores.rojo} />
    </AuthProvider>
  );
}
