import { StyleSheet, Text, View } from 'react-native';

import ListaPaginada from '../componentes/ListaPaginada';
import useLista from '../hooks/useLista';
import { colores, espacio, fuentes } from '../tema';

const NOMBRES = {
  tipo_pieza: 'Tipo',
  periodo_cultural: 'Periodo cultural',
  etiqueta: 'Etiqueta',
  capa: 'Capa',
  activo: 'Activo',
};

const fecha = (iso) => new Date(iso).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' });

// Solo lectura: el servidor registra cada cambio automáticamente.
export default function HistorialPieza({ route }) {
  const lista = useLista(`/piezas/${route.params.id}/historial/`);
  return (
    <View style={{ flex: 1, backgroundColor: colores.hueso }}>
      <ListaPaginada
        lista={lista}
        vacio="Esta pieza aún no tiene cambios registrados."
        renderItem={({ item }) => (
          <View style={styles.cambio}>
            <Text style={styles.campo}>{NOMBRES[item.campo_modificado] ?? item.campo_modificado}</Text>
            <Text style={styles.valor}>
              {item.valor_anterior || '—'} → {item.valor_nuevo || '—'}
            </Text>
            <Text style={styles.meta}>
              {item.usuario ?? 'Sistema'} · {fecha(item.fecha)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cambio: { backgroundColor: colores.blanco, borderWidth: 1, borderColor: colores.linea, borderRadius: 10, padding: espacio.m, marginBottom: espacio.s },
  campo: { fontFamily: fuentes.textoNegrita, fontSize: 14, color: colores.rojo },
  valor: { fontFamily: fuentes.texto, fontSize: 16, color: colores.tinta, marginVertical: 2 },
  meta: { fontFamily: fuentes.texto, fontSize: 13, color: colores.tintaSuave },
});
