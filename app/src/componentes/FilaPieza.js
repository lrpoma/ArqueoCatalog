import { Pressable, StyleSheet, Text, View } from 'react-native';

import { urlFoto } from '../api/config';
import { useCatalogos } from '../catalogos/CatalogosContext';
import { comunes } from '../estilosComunes';
import { colores, espacio, fuentes } from '../tema';
import { Etiquetita } from './Datos';
import FotoProtegida from './FotoProtegida';

// Tarjeta de una pieza para listados: miniatura, código, nombre, tipo y periodo.
export default function FilaPieza({ pieza, onPress }) {
  const catalogos = useCatalogos();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [comunes.tarjeta, styles.fila, pressed && { opacity: 0.85 }]}>
      {pieza.foto_principal ? (
        <FotoProtegida uri={urlFoto(pieza.foto_principal, true)} style={styles.foto} />
      ) : (
        <View style={[styles.foto, styles.sinFoto]}>
          <Text style={styles.iconoSinFoto}>◈</Text>
        </View>
      )}
      <View style={styles.texto}>
        <Text style={styles.codigo}>{pieza.codigo}</Text>
        <Text style={comunes.tarjetaTitulo} numberOfLines={2}>
          {pieza.nombre}
        </Text>
        <Text style={comunes.tarjetaTexto} numberOfLines={1}>
          {[catalogos.nombreTipo(pieza.tipo_pieza), catalogos.nombrePeriodo(pieza.periodo_cultural)].filter(Boolean).join(' · ')}
        </Text>
        <Text style={comunes.tarjetaTexto} numberOfLines={1}>
          {pieza.yacimiento_nombre} · capa {pieza.capa_codigo}
        </Text>
        {pieza.publica ? (
          <View style={{ marginTop: 6 }}>
            <Etiquetita texto="Pública" color={colores.tintaSuave} />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: { flexDirection: 'row', gap: espacio.m },
  foto: { width: 76, height: 76, borderRadius: 10 },
  sinFoto: { backgroundColor: colores.linea, alignItems: 'center', justifyContent: 'center' },
  iconoSinFoto: { fontSize: 28, color: colores.tintaSuave },
  texto: { flex: 1 },
  codigo: { fontFamily: fuentes.textoMedio, fontSize: 12, color: colores.rojo, letterSpacing: 0.5 },
});
