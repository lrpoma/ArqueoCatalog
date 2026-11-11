import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, espacio, fuentes } from '../tema';

// Lista desplegable (modal). `opciones` = [{ id, nombre }]. Con `opcional` se puede dejar vacío.
export default function Selector({ etiqueta, valor, opciones, onChange, opcional = false, error, deshabilitado = false, vacio = 'Sin opciones disponibles' }) {
  const [abierto, setAbierto] = useState(false);
  const actual = opciones.find((o) => o.id === valor);

  function elegir(id) {
    onChange(id);
    setAbierto(false);
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={deshabilitado}
        onPress={() => setAbierto(true)}
        style={[styles.caja, error && styles.cajaError, deshabilitado && { opacity: 0.5 }]}
      >
        <Text style={[styles.valor, !actual && { color: colores.tintaSuave }]} numberOfLines={1}>
          {actual ? actual.nombre : 'Seleccionar…'}
        </Text>
        <Text style={styles.flecha}>▾</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.fondo} onPress={() => setAbierto(false)}>
          <Pressable style={styles.hoja}>
            <Text style={styles.titulo}>{etiqueta}</Text>
            <FlatList
              data={opcional ? [{ id: null, nombre: 'Ninguna' }, ...opciones] : opciones}
              keyExtractor={(o) => String(o.id)}
              ListEmptyComponent={<Text style={styles.vacio}>{vacio}</Text>}
              renderItem={({ item }) => (
                <Pressable onPress={() => elegir(item.id)} style={styles.opcion}>
                  <Text style={[styles.textoOpcion, item.id === valor && styles.seleccionada]}>{item.nombre}</Text>
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: espacio.m },
  etiqueta: { fontFamily: fuentes.textoMedio, fontSize: 14, color: colores.tintaSuave, marginBottom: espacio.xs },
  caja: {
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: colores.linea,
    borderRadius: 12,
    backgroundColor: colores.blanco,
    paddingHorizontal: espacio.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cajaError: { borderColor: colores.rojo },
  valor: { flex: 1, fontFamily: fuentes.texto, fontSize: 16, color: colores.tinta },
  flecha: { fontSize: 16, color: colores.tintaSuave, marginLeft: espacio.s },
  error: { fontFamily: fuentes.texto, fontSize: 13, color: colores.rojo, marginTop: espacio.xs },
  fondo: { flex: 1, backgroundColor: 'rgba(26,26,26,0.5)', justifyContent: 'center', padding: espacio.l },
  hoja: { backgroundColor: colores.blanco, borderRadius: 16, maxHeight: '70%', paddingVertical: espacio.m },
  titulo: { fontFamily: fuentes.titulo, fontSize: 20, color: colores.tinta, paddingHorizontal: espacio.m, marginBottom: espacio.s },
  opcion: { paddingVertical: 14, paddingHorizontal: espacio.m },
  textoOpcion: { fontFamily: fuentes.texto, fontSize: 16, color: colores.tinta },
  seleccionada: { fontFamily: fuentes.textoNegrita, color: colores.rojo },
  vacio: { fontFamily: fuentes.texto, color: colores.tintaSuave, padding: espacio.m },
});
