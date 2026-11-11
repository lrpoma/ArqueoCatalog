import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CapaDetalle from '../screens/CapaDetalle';
import CapaForm from '../screens/CapaForm';
import Historial from '../screens/Historial';
import PiezaDetalle from '../screens/PiezaDetalle';
import PiezaForm from '../screens/PiezaForm';
import PiezasLista from '../screens/PiezasLista';
import YacimientoDetalle from '../screens/YacimientoDetalle';
import YacimientoForm from '../screens/YacimientoForm';
import YacimientosLista from '../screens/YacimientosLista';
import { colores, fuentes } from '../tema';

const Pila = createNativeStackNavigator();

const opciones = {
  headerStyle: { backgroundColor: colores.rojo },
  headerTintColor: colores.blanco,
  headerTitleStyle: { fontFamily: fuentes.titulo, fontSize: 20 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colores.hueso },
};

// Cada pestaña tiene su propia pila, con las mismas pantallas registradas: así se puede ir de una
// pieza a su capa (o al revés) sin salir de la pestaña. Solo cambia la pantalla inicial.
const pantallas = [
  <Pila.Screen key="YacimientosLista" name="YacimientosLista" component={YacimientosLista} options={{ title: 'Yacimientos' }} />,
  <Pila.Screen key="YacimientoDetalle" name="YacimientoDetalle" component={YacimientoDetalle} options={{ title: 'Yacimiento' }} />,
  <Pila.Screen key="YacimientoForm" name="YacimientoForm" component={YacimientoForm} />,
  <Pila.Screen key="CapaDetalle" name="CapaDetalle" component={CapaDetalle} options={{ title: 'Capa' }} />,
  <Pila.Screen key="CapaForm" name="CapaForm" component={CapaForm} />,
  <Pila.Screen key="PiezasLista" name="PiezasLista" component={PiezasLista} options={{ title: 'Piezas' }} />,
  <Pila.Screen key="PiezaDetalle" name="PiezaDetalle" component={PiezaDetalle} options={{ title: 'Pieza' }} />,
  <Pila.Screen key="PiezaForm" name="PiezaForm" component={PiezaForm} />,
  <Pila.Screen key="Historial" name="Historial" component={Historial} options={{ title: 'Historial' }} />,
];

export const PilaYacimientos = () => (
  <Pila.Navigator initialRouteName="YacimientosLista" screenOptions={opciones}>
    {pantallas}
  </Pila.Navigator>
);

export const PilaPiezas = () => (
  <Pila.Navigator initialRouteName="PiezasLista" screenOptions={opciones}>
    {pantallas}
  </Pila.Navigator>
);
