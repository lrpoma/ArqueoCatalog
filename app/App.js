import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import Perfil from './src/screens/Perfil';
import Piezas from './src/screens/Piezas';
import Yacimientos from './src/screens/Yacimientos';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Yacimientos" component={Yacimientos} />
        <Tab.Screen name="Piezas" component={Piezas} />
        <Tab.Screen name="Perfil" component={Perfil} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
