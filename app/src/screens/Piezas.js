import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BarraBusqueda from '../componentes/BarraBusqueda';
import ListaPaginada from '../componentes/ListaPaginada';
import Selector from '../componentes/Selector';
import Tarjeta from '../componentes/Tarjeta';
import { useCatalogos } from '../catalogos/CatalogosContext';
import useDebounce from '../hooks/useDebounce';
import useLista from '../hooks/useLista';
import { colores, espacio, fuentes } from '../tema';

// Las piezas nacen dentro de una capa (Yacimientos → capa → Pieza), por eso aquí se consultan, buscan y filtran.
export default function Piezas({ navigation }) {
  const { periodos, tipos, etiquetas } = useCatalogos();
  const [texto, setTexto] = useState('');
  const [periodo, setPeriodo] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [etiqueta, setEtiqueta] = useState(null);
  const [verFiltros, setVerFiltros] = useState(false);

  const busqueda = useDebounce(texto.trim());
  const params = {};
  if (busqueda) params.search = busqueda;
  if (periodo) params.periodo_cultural = periodo;
  if (tipo) params.tipo_pieza = tipo;
  if (etiqueta) params.etiqueta = etiqueta;
  const activos = [periodo, tipo, etiqueta].filter(Boolean).length;
  const lista = useLista('/piezas/', params);

  const limpiar = () => {
    setPeriodo(null);
    setTipo(null);
    setEtiqueta(null);
  };

  const filtros = (
    <View style={styles.filtros}>
      <Selector etiqueta="Periodo cultural" opciones={periodos} valor={periodo} onChange={setPeriodo} opcional />
      <Selector etiqueta="Tipo de pieza" opciones={tipos} valor={tipo} onChange={setTipo} opcional />
      <Selector etiqueta="Etiqueta" opciones={etiquetas} valor={etiqueta} onChange={setEtiqueta} opcional />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colores.hueso }}>
      <BarraBusqueda valor={texto} onChange={setTexto} placeholder="Buscar por código, nombre o material" />
      <View style={styles.filaFiltros}>
        <Pressable accessibilityRole="button" onPress={() => setVerFiltros((v) => !v)}>
          <Text style={styles.enlace}>
            {verFiltros ? 'Ocultar filtros' : 'Filtros'}
            {activos ? ` (${activos})` : ''}
          </Text>
        </Pressable>
        {activos > 0 && (
          <Pressable accessibilityRole="button" onPress={limpiar}>
            <Text style={styles.enlace}>Quitar filtros</Text>
          </Pressable>
        )}
      </View>
      <ListaPaginada
        lista={lista}
        encabezado={verFiltros ? filtros : null}
        vacio={busqueda || activos ? 'Ninguna pieza coincide con la búsqueda.' : 'Aún no hay piezas. Se registran desde una capa de un yacimiento.'}
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

const styles = StyleSheet.create({
  filaFiltros: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: espacio.m, paddingVertical: espacio.s },
  enlace: { fontFamily: fuentes.textoNegrita, fontSize: 14, color: colores.rojo, paddingVertical: 6 },
  filtros: { marginBottom: espacio.m },
});
