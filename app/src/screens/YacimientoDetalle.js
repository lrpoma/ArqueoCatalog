import { Linking, StyleSheet, Text, View } from 'react-native';

import { confirmarDesactivar, Fila as Acciones, useEsAdministrador } from '../componentes/Acciones';
import Boton from '../componentes/Boton';
import BotonFlotante from '../componentes/BotonFlotante';
import FilaDato from '../componentes/Fila';
import ListaPaginada from '../componentes/ListaPaginada';
import Tarjeta from '../componentes/Tarjeta';
import { useCatalogos } from '../catalogos/CatalogosContext';
import useLista from '../hooks/useLista';
import useRegistro from '../hooks/useRegistro';
import { colores, espacio, fuentes } from '../tema';
import { ESTADOS_YACIMIENTO } from './opciones';

export default function YacimientoDetalle({ navigation, route }) {
  const { id } = route.params;
  const { periodos } = useCatalogos();
  const esAdmin = useEsAdministrador();
  const { dato: y, error } = useRegistro(`/yacimientos/${id}/`);
  const capas = useLista(`/yacimientos/${id}/capas/`);

  if (!y) return <Text style={styles.aviso}>{error || 'Cargando…'}</Text>;

  const verEnMapa = () =>
    Linking.openURL(`geo:${y.latitud},${y.longitud}?q=${y.latitud},${y.longitud}(${encodeURIComponent(y.nombre)})`);

  const encabezado = (
    <View>
      <FilaDato etiqueta="Periodo cultural" valor={periodos.find((p) => p.id === y.periodo_cultural)?.nombre} />
      <FilaDato etiqueta="Estado" valor={ESTADOS_YACIMIENTO.find((e) => e.valor === y.estado)?.texto} />
      <FilaDato etiqueta="Coordenadas" valor={`${y.latitud}, ${y.longitud}`} />
      <FilaDato etiqueta="Investigador responsable" valor={y.investigador_nombre} />
      <Acciones>
        <Boton titulo="Ver en el mapa" onPress={verEnMapa} />
        <Boton variante="secundario" titulo="Editar yacimiento" onPress={() => navigation.navigate('YacimientoForm', { yacimiento: y })} />
        {esAdmin && (
          <Boton
            variante="secundario"
            titulo="Desactivar yacimiento"
            onPress={() => confirmarDesactivar({ ruta: `/yacimientos/${id}/`, nombre: y.nombre, alTerminar: navigation.goBack })}
          />
        )}
      </Acciones>
      <Text style={styles.seccion}>Capas estratigráficas</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colores.hueso }}>
      <ListaPaginada
        lista={capas}
        encabezado={encabezado}
        vacio="Este yacimiento aún no tiene capas."
        renderItem={({ item }) => (
          <Tarjeta
            titulo={`Capa ${item.codigo}`}
            detalle={`${item.profundidad_desde} – ${item.profundidad_hasta} m`}
            onPress={() => navigation.navigate('CapaDetalle', { yacimientoId: id, id: item.id })}
          />
        )}
      />
      <BotonFlotante titulo="Capa" onPress={() => navigation.navigate('CapaForm', { yacimientoId: id })} />
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: { fontFamily: fuentes.texto, padding: espacio.l, color: colores.tintaSuave },
  seccion: { fontFamily: fuentes.titulo, fontSize: 22, color: colores.tinta, marginBottom: espacio.s },
});
