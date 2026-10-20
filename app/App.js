import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/auth/AuthContext';
import { CatalogosProvider } from './src/catalogos/CatalogosContext';
import CapaDetalle from './src/screens/CapaDetalle';
import CapaForm from './src/screens/CapaForm';
import HistorialPieza from './src/screens/HistorialPieza';
import Login from './src/screens/Login';
import PiezaDetalle from './src/screens/PiezaDetalle';
import PiezaForm from './src/screens/PiezaForm';
import QrPieza from './src/screens/QrPieza';
import YacimientoDetalle from './src/screens/YacimientoDetalle';
import YacimientoForm from './src/screens/YacimientoForm';
import Perfil from './src/screens/Perfil';
import Piezas from './src/screens/Piezas';
import Yacimientos from './src/screens/Yacimientos';
import { colores, fuentes } from './src/tema';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const cabecera = {
  headerStyle: { backgroundColor: colores.rojo },
  headerTintColor: colores.blanco,
  headerTitleStyle: { fontFamily: fuentes.titulo, fontSize: 22 },
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

function Pestañas() {
  return (
    <Tab.Navigator
      screenOptions={{
        ...cabecera,
        tabBarActiveTintColor: colores.rojo,
        tabBarInactiveTintColor: colores.tintaSuave,
        tabBarLabelStyle: { fontFamily: fuentes.textoMedio, fontSize: 12 },
        tabBarStyle: { borderTopColor: colores.linea },
      }}
    >
      <Tab.Screen name="Yacimientos" component={Yacimientos} />
      <Tab.Screen name="Piezas" component={Piezas} />
      <Tab.Screen name="Perfil" component={Perfil} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function Principal() {
  const { usuario, cargando } = useAuth();
  if (cargando) return null;
  if (!usuario) return <Login />;

  return (
    <CatalogosProvider>
      <NavigationContainer theme={temaNavegacion}>
        <Stack.Navigator screenOptions={cabecera}>
          <Stack.Screen name="Inicio" component={Pestañas} options={{ headerShown: false }} />
          <Stack.Screen name="YacimientoDetalle" component={YacimientoDetalle} options={{ title: 'Yacimiento' }} />
          <Stack.Screen name="YacimientoForm" component={YacimientoForm} options={({ route }) => ({ title: route.params?.yacimiento ? 'Editar yacimiento' : 'Nuevo yacimiento' })} />
          <Stack.Screen name="CapaDetalle" component={CapaDetalle} options={{ title: 'Capa' }} />
          <Stack.Screen name="CapaForm" component={CapaForm} options={({ route }) => ({ title: route.params?.capa ? 'Editar capa' : 'Nueva capa' })} />
          <Stack.Screen name="PiezaDetalle" component={PiezaDetalle} options={{ title: 'Pieza' }} />
          <Stack.Screen name="PiezaForm" component={PiezaForm} options={({ route }) => ({ title: route.params?.pieza ? 'Editar pieza' : 'Nueva pieza' })} />
          <Stack.Screen name="HistorialPieza" component={HistorialPieza} options={{ title: 'Historial' }} />
          <Stack.Screen name="QrPieza" component={QrPieza} options={{ title: 'Código QR' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </CatalogosProvider>
  );
}

export default function App() {
  const [cargadas] = useFonts({ Fraunces_600SemiBold, Inter_400Regular, Inter_500Medium, Inter_600SemiBold });
  if (!cargadas) return null;

  return (
    <AuthProvider>
      <Principal />
      <StatusBar style="light" backgroundColor={colores.rojo} />
    </AuthProvider>
  );
}
