import { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';

import { cliente, errorDeFormulario } from '../api/cliente';
import { useAuth } from '../auth/AuthContext';
import Boton from '../componentes/Boton';
import { Dato, Seccion } from '../componentes/Datos';
import { Cargando, ErrorReintento, Vacio } from '../componentes/Estados';
import Fab from '../componentes/Fab';
import FilaPieza from '../componentes/FilaPieza';
import { comunes } from '../estilosComunes';
import { useLista } from '../hooks/useLista';
import { useRecurso } from '../hooks/useRecurso';
import { colores, espacio } from '../tema';
import { confirmar } from '../utils/confirmar';
import { metros } from '../utils/formato';

export default function CapaDetalle({ route, navigation }) {
  const { yacimientoId, id } = route.params;
  const { usuario } = useAuth();
  const { datos: capa, cargando, error, recargar } = useRecurso(`/yacimientos/${yacimientoId}/capas/${id}/`);
  const piezas = useLista('/piezas/', { capa: id });
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (capa) navigation.setOptions({ title: `Capa ${capa.codigo}` });
  }, [capa, navigation]);

  function desactivar() {
    confirmar({
      titulo: 'Desactivar capa',
      mensaje: 'La capa dejará de mostrarse en la app. No se borra de la base de datos.',
      accion: 'Desactivar',
      alConfirmar: async () => {
        setProcesando(true);
        try {
          await cliente.delete(`/yacimientos/${yacimientoId}/capas/${id}/`);
          navigation.goBack();
        } catch (e) {
          setProcesando(false);
          Alert.alert('No se pudo desactivar', errorDeFormulario(e).general);
        }
      },
    });
  }

  if (cargando) return <Cargando />;
  if (error === 'noEncontrado') return <Vacio texto="Esta capa ya no existe o fue desactivada." />;
  if (error || !capa) return <ErrorReintento onReintentar={recargar} />;

  const cabecera = (
    <View>
      <Dato etiqueta="Profundidad" valor={`${metros(capa.profundidad_desde)} – ${metros(capa.profundidad_hasta)}`} />
      {capa.descripcion ? <Dato etiqueta="Descripción" valor={capa.descripcion} /> : null}
      <View style={comunes.acciones}>
        <Boton titulo="Editar capa" variante="secundario" onPress={() => navigation.navigate('CapaForm', { yacimientoId, id })} />
        {usuario.rol === 'administrador' ? (
          <Boton titulo="Desactivar capa" variante="secundario" cargando={procesando} onPress={desactivar} />
        ) : null}
      </View>
      <Seccion titulo="Piezas de esta capa" />
    </View>
  );

  return (
    <View style={comunes.pantalla}>
      <FlatList
        data={piezas.items}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ padding: espacio.l, paddingBottom: 96 }}
        ListHeaderComponent={cabecera}
        refreshControl={
          <RefreshControl
            refreshing={piezas.refrescando}
            onRefresh={() => {
              piezas.refrescar();
              recargar();
            }}
            colors={[colores.rojo]}
          />
        }
        onEndReached={piezas.cargarMas}
        ListEmptyComponent={piezas.cargando ? <Cargando /> : <Vacio texto="Aún no hay piezas registradas en esta capa." />}
        renderItem={({ item }) => <FilaPieza pieza={item} onPress={() => navigation.navigate('PiezaDetalle', { id: item.id })} />}
      />
      <Fab titulo="Pieza" onPress={() => navigation.navigate('PiezaForm', { capaId: id, yacimientoId })} />
    </View>
  );
}
