import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import BarraBusqueda from '../componentes/BarraBusqueda';
import { Etiquetita } from '../componentes/Datos';
import { Cargando, ErrorReintento, Vacio } from '../componentes/Estados';
import Fab from '../componentes/Fab';
import { useCatalogos } from '../catalogos/CatalogosContext';
import { comunes } from '../estilosComunes';
import { useLista } from '../hooks/useLista';
import { colores } from '../tema';

export default function YacimientosLista({ navigation }) {
  const [busqueda, setBusqueda] = useState('');
  const { items, cargando, refrescando, error, refrescar, cargarMas, reintentar } = useLista(
    '/yacimientos/',
    busqueda ? { search: busqueda } : {},
  );
  const catalogos = useCatalogos();

  let contenido;
  if (cargando) contenido = <Cargando />;
  else if (error && items.length === 0) contenido = <ErrorReintento onReintentar={reintentar} />;
  else
    contenido = (
      <FlatList
        data={items}
        keyExtractor={(y) => String(y.id)}
        contentContainerStyle={comunes.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[colores.rojo]} />}
        onEndReached={cargarMas}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          <Vacio texto={busqueda ? 'Ningún yacimiento coincide con la búsqueda.' : 'Aún no hay yacimientos. Crea el primero con el botón de abajo.'} />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('YacimientoDetalle', { id: item.id })}
            style={({ pressed }) => [comunes.tarjeta, pressed && { opacity: 0.85 }]}
          >
            <Text style={comunes.tarjetaTitulo}>{item.nombre}</Text>
            <Text style={comunes.tarjetaTexto}>{catalogos.nombrePeriodo(item.periodo_cultural)}</Text>
            <View style={{ marginTop: 8 }}>
              <Etiquetita texto={catalogos.nombreEstado(item.estado)} color={colores.tintaSuave} />
            </View>
          </Pressable>
        )}
      />
    );

  return (
    <View style={comunes.pantalla}>
      <BarraBusqueda placeholder="Buscar yacimiento…" onBuscar={setBusqueda} />
      {contenido}
      <Fab titulo="Yacimiento" onPress={() => navigation.navigate('YacimientoForm', {})} />
    </View>
  );
}
