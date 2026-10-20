import { StyleSheet, Text, View } from 'react-native';

import { confirmarDesactivar, Fila as Acciones, useEsAdministrador } from '../componentes/Acciones';
import Boton from '../componentes/Boton';
import BotonFlotante from '../componentes/BotonFlotante';
import FilaDato from '../componentes/Fila';
import ListaPaginada from '../componentes/ListaPaginada';
import Tarjeta from '../componentes/Tarjeta';
import useLista from '../hooks/useLista';
import useRegistro from '../hooks/useRegistro';
import { colores, espacio, fuentes } from '../tema';

export default function CapaDetalle({ navigation, route }) {
  const { yacimientoId, id } = route.params;
  const esAdmin = useEsAdministrador();
  const ruta = `/yacimientos/${yacimientoId}/capas/${id}/`;
  const { dato: capa, error } = useRegistro(ruta);
  const piezas = useLista('/piezas/', { capa: id });

  if (!capa) return <Text style={styles.aviso}>{error || 'Cargando…'}</Text>;

  const encabezado = (
    <View>
      <FilaDato etiqueta="Profundidad" valor={`${capa.profundidad_desde} – ${capa.profundidad_hasta} m`} />
      <FilaDato etiqueta="Descripción" valor={capa.descripcion} />
      <Acciones>
        <Boton variante="secundario" titulo="Editar capa" onPress={() => navigation.navigate('CapaForm', { yacimientoId, capa })} />
        {esAdmin && (
          <Boton
            variante="secundario"
            titulo="Desactivar capa"
            onPress={() => confirmarDesactivar({ ruta, nombre: `la capa ${capa.codigo}`, alTerminar: navigation.goBack })}
          />
        )}
      </Acciones>
      <Text style={styles.seccion}>Piezas de la capa</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colores.hueso }}>
      <ListaPaginada
        lista={piezas}
        encabezado={encabezado}
        vacio="Aún no hay piezas en esta capa."
        renderItem={({ item }) => (
          <Tarjeta etiqueta={item.codigo} titulo={item.nombre} onPress={() => navigation.navigate('PiezaDetalle', { id: item.id })} />
        )}
      />
      <BotonFlotante titulo="Pieza" onPress={() => navigation.navigate('PiezaForm', { capa })} />
    </View>
  );
}

const styles = StyleSheet.create({
  aviso: { fontFamily: fuentes.texto, padding: espacio.l, color: colores.tintaSuave },
  seccion: { fontFamily: fuentes.titulo, fontSize: 22, color: colores.tinta, marginBottom: espacio.s },
});
