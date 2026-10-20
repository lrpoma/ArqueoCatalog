import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

// Lista con estados de carga, error y vacío; arrastrar hacia abajo recarga y el final pide más páginas.
export default function ListaPaginada({ lista, renderItem, vacio, encabezado, ...props }) {
  const { datos, cargando, error, recargar, cargarMas } = lista;
  if (cargando) return <ActivityIndicator style={{ marginTop: espacio.xl }} color={colores.rojo} />;
  return (
    <FlatList
      data={datos}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      refreshing={false}
      onRefresh={recargar}
      onEndReached={cargarMas}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={encabezado}
      ListEmptyComponent={
        <View style={styles.centro}>
          <Text style={styles.texto}>{error || vacio}</Text>
        </View>
      }
      contentContainerStyle={{ padding: espacio.m, paddingBottom: 96 }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', padding: espacio.l },
  texto: { fontFamily: fuentes.texto, fontSize: 15, color: colores.tintaSuave, textAlign: 'center' },
});
