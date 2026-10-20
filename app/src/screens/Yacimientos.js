import { View } from 'react-native';

import BotonFlotante from '../componentes/BotonFlotante';
import ListaPaginada from '../componentes/ListaPaginada';
import Tarjeta from '../componentes/Tarjeta';
import useLista from '../hooks/useLista';
import { colores } from '../tema';
import { ESTADOS_YACIMIENTO } from './opciones';

export default function Yacimientos({ navigation }) {
  const lista = useLista('/yacimientos/');
  return (
    <View style={{ flex: 1, backgroundColor: colores.hueso }}>
      <ListaPaginada
        lista={lista}
        vacio="Aún no hay yacimientos. Crea el primero con el botón de abajo."
        renderItem={({ item }) => (
          <Tarjeta
            titulo={item.nombre}
            detalle={ESTADOS_YACIMIENTO.find((e) => e.valor === item.estado)?.texto}
            onPress={() => navigation.navigate('YacimientoDetalle', { id: item.id })}
          />
        )}
      />
      <BotonFlotante titulo="Yacimiento" onPress={() => navigation.navigate('YacimientoForm', {})} />
    </View>
  );
}
