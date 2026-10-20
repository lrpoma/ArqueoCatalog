import { View } from 'react-native';

import ListaPaginada from '../componentes/ListaPaginada';
import Tarjeta from '../componentes/Tarjeta';
import useLista from '../hooks/useLista';
import { colores } from '../tema';

// Las piezas nacen dentro de una capa (Yacimientos → capa → Pieza), por eso aquí solo se consultan.
export default function Piezas({ navigation }) {
  const lista = useLista('/piezas/');
  return (
    <View style={{ flex: 1, backgroundColor: colores.hueso }}>
      <ListaPaginada
        lista={lista}
        vacio="Aún no hay piezas. Se registran desde una capa de un yacimiento."
        renderItem={({ item }) => (
          <Tarjeta
            etiqueta={item.codigo}
            titulo={item.nombre}
            detalle={`${item.yacimiento_nombre} · capa ${item.capa_codigo}`}
            onPress={() => navigation.navigate('PiezaDetalle', { id: item.id })}
          />
        )}
      />
    </View>
  );
}
