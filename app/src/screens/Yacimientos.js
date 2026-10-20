import { useState } from 'react';
import { View } from 'react-native';

import BarraBusqueda from '../componentes/BarraBusqueda';
import BotonFlotante from '../componentes/BotonFlotante';
import ListaPaginada from '../componentes/ListaPaginada';
import Tarjeta from '../componentes/Tarjeta';
import useDebounce from '../hooks/useDebounce';
import useLista from '../hooks/useLista';
import { colores } from '../tema';
import { ESTADOS_YACIMIENTO } from './opciones';

export default function Yacimientos({ navigation }) {
  const [texto, setTexto] = useState('');
  const busqueda = useDebounce(texto.trim());
  const lista = useLista('/yacimientos/', busqueda ? { search: busqueda } : {});
  return (
    <View style={{ flex: 1, backgroundColor: colores.hueso }}>
      <BarraBusqueda valor={texto} onChange={setTexto} placeholder="Buscar yacimiento por nombre" />
      <ListaPaginada
        lista={lista}
        vacio={busqueda ? 'Ningún yacimiento coincide con la búsqueda.' : 'Aún no hay yacimientos. Crea el primero con el botón de abajo.'}
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
