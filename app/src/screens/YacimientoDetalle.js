import { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, RefreshControl, Text, View } from 'react-native';

import { cliente, errorDeFormulario } from '../api/cliente';
import { useAuth } from '../auth/AuthContext';
import { useCatalogos } from '../catalogos/CatalogosContext';
import Boton from '../componentes/Boton';
import { Dato, Seccion } from '../componentes/Datos';
import { Cargando, ErrorReintento, Vacio } from '../componentes/Estados';
import Fab from '../componentes/Fab';
import { comunes } from '../estilosComunes';
import { useLista } from '../hooks/useLista';
import { useRecurso } from '../hooks/useRecurso';
import { colores, espacio } from '../tema';
import { confirmar } from '../utils/confirmar';
import { metros } from '../utils/formato';

export default function YacimientoDetalle({ route, navigation }) {
  const { id } = route.params;
  const { usuario } = useAuth();
  const catalogos = useCatalogos();
  const { datos: y, cargando, error, recargar } = useRecurso(`/yacimientos/${id}/`);
  const capas = useLista(`/yacimientos/${id}/capas/`);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (y) navigation.setOptions({ title: y.nombre });
  }, [y, navigation]);

  async function verEnMapa() {
    const etiqueta = encodeURIComponent(y.nombre);
    try {
      await Linking.openURL(`geo:${y.latitud},${y.longitud}?q=${y.latitud},${y.longitud}(${etiqueta})`);
    } catch {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${y.latitud},${y.longitud}`).catch(() =>
        Alert.alert('Mapa', 'No hay una aplicación de mapas disponible.'),
      );
    }
  }

  function desactivar() {
    confirmar({
      titulo: 'Desactivar yacimiento',
      mensaje: 'El yacimiento dejará de mostrarse en la app. No se borra de la base de datos.',
      accion: 'Desactivar',
      alConfirmar: async () => {
        setProcesando(true);
        try {
          await cliente.delete(`/yacimientos/${id}/`);
          navigation.goBack();
        } catch (e) {
          setProcesando(false);
          Alert.alert('No se pudo desactivar', errorDeFormulario(e).general);
        }
      },
    });
  }

  if (cargando) return <Cargando />;
  if (error === 'noEncontrado') return <Vacio texto="Este yacimiento ya no existe o fue desactivado." />;
  if (error || !y) return <ErrorReintento onReintentar={recargar} />;

  const cabecera = (
    <View style={{ marginBottom: espacio.s }}>
      <Dato etiqueta="Periodo cultural" valor={catalogos.nombrePeriodo(y.periodo_cultural)} />
      <Dato etiqueta="Estado" valor={catalogos.nombreEstado(y.estado)} />
      <Dato etiqueta="Coordenadas" valor={`${y.latitud}, ${y.longitud}`} />
      <Dato etiqueta="Investigador responsable" valor={y.investigador_nombre} />
      {y.descripcion ? <Dato etiqueta="Descripción" valor={y.descripcion} /> : null}
      <View style={comunes.acciones}>
        <Boton titulo="Ver en el mapa" onPress={verEnMapa} />
        <Boton titulo="Editar yacimiento" variante="secundario" onPress={() => navigation.navigate('YacimientoForm', { id })} />
        {usuario.rol === 'administrador' ? (
          <Boton titulo="Desactivar yacimiento" variante="secundario" cargando={procesando} onPress={desactivar} />
        ) : null}
      </View>
      <Seccion titulo="Capas estratigráficas" />
    </View>
  );

  return (
    <View style={comunes.pantalla}>
      <FlatList
        data={capas.items}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={{ padding: espacio.l, paddingBottom: 96 }}
        ListHeaderComponent={cabecera}
        refreshControl={
          <RefreshControl
            refreshing={capas.refrescando}
            onRefresh={() => {
              capas.refrescar();
              recargar();
            }}
            colors={[colores.rojo]}
          />
        }
        onEndReached={capas.cargarMas}
        ListEmptyComponent={capas.cargando ? <Cargando /> : <Vacio texto="Este yacimiento aún no tiene capas." />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('CapaDetalle', { yacimientoId: id, id: item.id })}
            style={({ pressed }) => [comunes.tarjeta, pressed && { opacity: 0.85 }]}
          >
            <Text style={comunes.tarjetaTitulo}>Capa {item.codigo}</Text>
            <Text style={comunes.tarjetaTexto}>
              {metros(item.profundidad_desde)} – {metros(item.profundidad_hasta)}
            </Text>
            {item.descripcion ? (
              <Text style={comunes.tarjetaTexto} numberOfLines={2}>
                {item.descripcion}
              </Text>
            ) : null}
          </Pressable>
        )}
      />
      <Fab titulo="Capa" onPress={() => navigation.navigate('CapaForm', { yacimientoId: id })} />
    </View>
  );
}
