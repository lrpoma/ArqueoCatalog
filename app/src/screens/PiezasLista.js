import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';

import BarraBusqueda from '../componentes/BarraBusqueda';
import { Cargando, ErrorReintento, Vacio } from '../componentes/Estados';
import Fab from '../componentes/Fab';
import FilaPieza from '../componentes/FilaPieza';
import { comunes } from '../estilosComunes';
import { useLista } from '../hooks/useLista';
import { colores } from '../tema';

export default function PiezasLista({ navigation }) {
  const [busqueda, setBusqueda] = useState('');
  const { items, cargando, refrescando, error, refrescar, cargarMas, reintentar } = useLista(
    '/piezas/',
    busqueda ? { search: busqueda } : {},
  );

  let contenido;
  if (cargando) contenido = <Cargando />;
  else if (error && items.length === 0) contenido = <ErrorReintento onReintentar={reintentar} />;
  else
    contenido = (
      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={comunes.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[colores.rojo]} />}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <Vacio texto={busqueda ? 'Ninguna pieza coincide con la búsqueda.' : 'Aún no hay piezas. Registra la primera con el botón de abajo.'} />
        }
        renderItem={({ item }) => <FilaPieza pieza={item} onPress={() => navigation.navigate('PiezaDetalle', { id: item.id })} />}
      />
    );

  return (
    <View style={comunes.pantalla}>
      <BarraBusqueda placeholder="Buscar por código, nombre o material…" onBuscar={setBusqueda} />
      {contenido}
      <Fab titulo="Pieza" onPress={() => navigation.navigate('PiezaForm', {})} />
    </View>
  );
}
