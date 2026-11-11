import { FlatList, RefreshControl, Text, View } from 'react-native';

import { Cargando, ErrorReintento, Vacio } from '../componentes/Estados';
import { comunes } from '../estilosComunes';
import { useLista } from '../hooks/useLista';
import { colores, espacio, fuentes } from '../tema';
import { formatearFecha } from '../utils/formato';

const CAMPOS = {
  nombre: 'Nombre',
  descripcion: 'Descripción',
  tipo_pieza: 'Tipo de pieza',
  material: 'Material',
  periodo_cultural: 'Periodo cultural',
  etiqueta: 'Etiqueta',
  capa: 'Capa',
  publica: 'Ficha pública',
  activo: 'Activa',
};

// Historial de solo lectura: lo registra el backend con señales; la app nunca lo escribe.
export default function Historial({ route }) {
  const { id } = route.params;
  const { items, cargando, refrescando, error, refrescar, cargarMas, reintentar } = useLista(`/piezas/${id}/historial/`);

  if (cargando) return <Cargando />;
  if (error && items.length === 0) return <ErrorReintento onReintentar={reintentar} />;

  return (
    <View style={comunes.pantalla}>
      <FlatList
        data={items}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={comunes.lista}
        refreshControl={<RefreshControl refreshing={refrescando} onRefresh={refrescar} colors={[colores.rojo]} />}
        onEndReached={cargarMas}
        ListEmptyComponent={<Vacio texto="Esta pieza aún no tiene cambios registrados." />}
        renderItem={({ item }) => (
          <View style={comunes.tarjeta}>
            <Text style={comunes.tarjetaTitulo}>{CAMPOS[item.campo_modificado] ?? item.campo_modificado}</Text>
            <Text style={{ fontFamily: fuentes.texto, fontSize: 15, color: colores.tinta, marginTop: espacio.xs }}>
              <Text style={{ color: colores.tintaSuave }}>{item.valor_anterior || '(vacío)'}</Text>
              {'  →  '}
              <Text style={{ fontFamily: fuentes.textoNegrita }}>{item.valor_nuevo || '(vacío)'}</Text>
            </Text>
            <Text style={comunes.tarjetaTexto}>
              {item.usuario ?? 'Sistema'} · {formatearFecha(item.fecha)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
