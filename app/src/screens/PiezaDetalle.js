import { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { cliente, errorDeFormulario } from '../api/cliente';
import { API_URL, urlFoto } from '../api/config';
import { useAuth } from '../auth/AuthContext';
import { useCatalogos } from '../catalogos/CatalogosContext';
import Boton from '../componentes/Boton';
import { Dato, Etiquetita, Seccion } from '../componentes/Datos';
import { Cargando, ErrorReintento, Vacio } from '../componentes/Estados';
import FotoProtegida from '../componentes/FotoProtegida';
import { comunes } from '../estilosComunes';
import { useRecurso } from '../hooks/useRecurso';
import { colores, espacio, fuentes } from '../tema';
import { confirmar } from '../utils/confirmar';
import { elegirFoto, subirFoto } from '../utils/foto';

const ANCHO_FOTO = Dimensions.get('window').width * 0.78;

export default function PiezaDetalle({ route, navigation }) {
  const { id } = route.params;
  const { usuario } = useAuth();
  const catalogos = useCatalogos();
  const { datos: pieza, cargando, error, recargar } = useRecurso(`/piezas/${id}/`);
  const fotos = useRecurso(`/piezas/${id}/fotos/`);
  const [subiendo, setSubiendo] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [verQr, setVerQr] = useState(false);
  const [ampliada, setAmpliada] = useState(null);

  useEffect(() => {
    if (pieza) navigation.setOptions({ title: pieza.codigo });
  }, [pieza, navigation]);

  async function agregarFoto(origen) {
    try {
      const asset = await elegirFoto(origen);
      if (!asset) return;
      setSubiendo(true);
      await subirFoto(id, asset);
      await Promise.all([fotos.recargar(), recargar()]);
    } catch (e) {
      if (e.message === 'permiso') {
        Alert.alert('Permiso necesario', 'Permite el acceso a la cámara en los ajustes del teléfono para fotografiar piezas.');
      } else {
        const { general, campos } = errorDeFormulario(e);
        Alert.alert('No se pudo subir la foto', campos.archivo ?? general);
      }
    } finally {
      setSubiendo(false);
    }
  }

  function desactivar() {
    confirmar({
      titulo: 'Desactivar pieza',
      mensaje: 'La pieza dejará de mostrarse en la app y en la ficha pública. No se borra de la base de datos.',
      accion: 'Desactivar',
      alConfirmar: async () => {
        setProcesando(true);
        try {
          await cliente.delete(`/piezas/${id}/`);
          navigation.goBack();
        } catch (e) {
          setProcesando(false);
          Alert.alert('No se pudo desactivar', errorDeFormulario(e).general);
        }
      },
    });
  }

  if (cargando) return <Cargando />;
  if (error === 'noEncontrado') return <Vacio texto="Esta pieza ya no existe o fue desactivada." />;
  if (error || !pieza) return <ErrorReintento onReintentar={recargar} />;

  const listaFotos = fotos.datos ?? [];

  return (
    <View style={comunes.pantalla}>
      <ScrollView contentContainerStyle={{ paddingBottom: espacio.xl * 2 }}>
        {listaFotos.length > 0 ? (
          <FlatList
            horizontal
            data={listaFotos}
            keyExtractor={(f) => String(f.id)}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ padding: espacio.m, gap: espacio.s }}
            renderItem={({ item }) => (
              <Pressable onPress={() => setAmpliada(item.id)}>
                <FotoProtegida uri={item.url} style={{ width: ANCHO_FOTO, height: 220, borderRadius: 12 }} />
                {item.principal ? (
                  <View style={styles.insignia}>
                    <Etiquetita texto="Principal" color={colores.rojo} />
                  </View>
                ) : null}
              </Pressable>
            )}
          />
        ) : (
          <View style={styles.sinFotos}>
            <Text style={styles.textoSinFotos}>{fotos.cargando ? 'Cargando fotos…' : 'Esta pieza aún no tiene fotografías.'}</Text>
          </View>
        )}

        <View style={{ paddingHorizontal: espacio.l }}>
          <View style={[comunes.acciones, { flexDirection: 'row', marginTop: 0 }]}>
            <View style={{ flex: 1 }}>
              <Boton titulo="Tomar foto" cargando={subiendo} onPress={() => agregarFoto('camara')} />
            </View>
            <View style={{ flex: 1 }}>
              <Boton titulo="Galería" variante="secundario" cargando={subiendo} onPress={() => agregarFoto('galeria')} />
            </View>
          </View>

          <Text style={styles.nombre}>{pieza.nombre}</Text>
          <View style={{ alignSelf: 'flex-start', marginBottom: espacio.m }}>
            <Etiquetita texto={pieza.publica ? 'Ficha pública' : 'Ficha restringida'} color={pieza.publica ? colores.rojo : colores.tintaSuave} />
          </View>

          <Dato etiqueta="Tipo de pieza" valor={catalogos.nombreTipo(pieza.tipo_pieza)} />
          <Dato etiqueta="Periodo cultural" valor={catalogos.nombrePeriodo(pieza.periodo_cultural)} />
          <Dato etiqueta="Etiqueta" valor={catalogos.nombreEtiqueta(pieza.etiqueta)} />
          <Dato etiqueta="Material" valor={pieza.material} />
          {pieza.descripcion ? <Dato etiqueta="Descripción" valor={pieza.descripcion} /> : null}

          <Seccion titulo="Procedencia">
            <Pressable
              onPress={() => navigation.navigate('CapaDetalle', { yacimientoId: pieza.yacimiento, id: pieza.capa })}
              style={({ pressed }) => [comunes.tarjeta, pressed && { opacity: 0.85 }]}
            >
              <Text style={comunes.tarjetaTitulo}>{pieza.yacimiento_nombre}</Text>
              <Text style={comunes.tarjetaTexto}>Capa {pieza.capa_codigo} · ver capa ›</Text>
            </Pressable>
          </Seccion>

          <View style={comunes.acciones}>
            <Boton titulo="Ver código QR" onPress={() => setVerQr(true)} />
            <Boton titulo="Ver historial de cambios" variante="secundario" onPress={() => navigation.navigate('Historial', { id })} />
            <Boton titulo="Editar pieza" variante="secundario" onPress={() => navigation.navigate('PiezaForm', { id })} />
            {usuario.rol === 'administrador' ? (
              <Boton titulo="Desactivar pieza" variante="secundario" cargando={procesando} onPress={desactivar} />
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* QR: lo genera el backend; la app solo lo muestra. */}
      <Modal visible={verQr} transparent animationType="fade" onRequestClose={() => setVerQr(false)}>
        <Pressable style={styles.fondo} onPress={() => setVerQr(false)}>
          <Pressable style={styles.tarjetaQr}>
            <Text style={styles.codigoQr}>{pieza.codigo}</Text>
            <FotoProtegida uri={`${API_URL}/piezas/${id}/qr/`} style={styles.qr} resizeMode="contain" />
            <Text style={styles.ayudaQr}>
              {pieza.publica
                ? 'Al escanearlo se abre la ficha pública de la pieza.'
                : 'Esta pieza no es pública: al escanearlo se mostrará “Ficha restringida”.'}
            </Text>
            <Boton titulo="Cerrar" variante="secundario" onPress={() => setVerQr(false)} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Foto a pantalla completa. */}
      <Modal visible={ampliada !== null} transparent animationType="fade" onRequestClose={() => setAmpliada(null)}>
        <Pressable style={[styles.fondo, { padding: 0, backgroundColor: '#000' }]} onPress={() => setAmpliada(null)}>
          {ampliada !== null ? <FotoProtegida uri={urlFoto(ampliada)} style={{ width: '100%', height: '100%' }} resizeMode="contain" /> : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sinFotos: { height: 140, margin: espacio.m, borderRadius: 12, backgroundColor: colores.linea, alignItems: 'center', justifyContent: 'center' },
  textoSinFotos: { fontFamily: fuentes.texto, color: colores.tintaSuave },
  insignia: { position: 'absolute', top: espacio.s, left: espacio.s, backgroundColor: colores.blanco, borderRadius: 999 },
  nombre: { fontFamily: fuentes.titulo, fontSize: 26, color: colores.tinta, marginTop: espacio.l, marginBottom: espacio.s },
  fondo: { flex: 1, backgroundColor: 'rgba(26,26,26,0.6)', alignItems: 'center', justifyContent: 'center', padding: espacio.l },
  tarjetaQr: { backgroundColor: colores.blanco, borderRadius: 18, padding: espacio.l, alignItems: 'center', width: '100%', gap: espacio.m },
  codigoQr: { fontFamily: fuentes.titulo, fontSize: 22, color: colores.tinta },
  qr: { width: 260, height: 260, backgroundColor: colores.blanco },
  ayudaQr: { fontFamily: fuentes.texto, fontSize: 14, color: colores.tintaSuave, textAlign: 'center' },
});
