import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { cliente, mensajeDeGuardado } from '../api/cliente';
import Campo from '../componentes/Campo';
import Formulario from '../componentes/Formulario';
import Selector from '../componentes/Selector';
import { useCatalogos } from '../catalogos/CatalogosContext';
import { colores, espacio, fuentes } from '../tema';

// Alta (con la capa recibida) o edición. El historial lo registra el servidor con señales.
export default function PiezaForm({ navigation, route }) {
  const { capa, pieza: previa } = route.params;
  const { tipos, periodos, etiquetas } = useCatalogos();
  const [nombre, setNombre] = useState(previa?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(previa?.descripcion ?? '');
  const [material, setMaterial] = useState(previa?.material ?? '');
  const [tipo, setTipo] = useState(previa?.tipo_pieza ?? null);
  const [periodo, setPeriodo] = useState(previa?.periodo_cultural ?? null);
  const [etiqueta, setEtiqueta] = useState(previa?.etiqueta ?? null);
  const [publica, setPublica] = useState(previa?.publica ?? false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!nombre.trim() || !tipo || !periodo) {
      setError('Completa nombre, tipo y periodo cultural.');
      return;
    }
    setError('');
    setGuardando(true);
    const cuerpo = {
      nombre: nombre.trim(),
      descripcion,
      material,
      tipo_pieza: tipo,
      periodo_cultural: periodo,
      etiqueta,
      publica,
    };
    try {
      if (previa) {
        await cliente.patch(`/piezas/${previa.id}/`, cuerpo);
        navigation.goBack();
      } else {
        const { data } = await cliente.post('/piezas/', { ...cuerpo, capa: capa.id });
        navigation.replace('PiezaDetalle', { id: data.id });
      }
    } catch (e) {
      setError(mensajeDeGuardado(e));
      setGuardando(false);
    }
  }

  return (
    <Formulario onGuardar={guardar} guardando={guardando} error={error}>
      {!previa && <Text style={styles.capa}>Se registrará en la capa {capa.codigo}</Text>}
      <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} />
      <Campo etiqueta="Descripción" value={descripcion} onChangeText={setDescripcion} multilinea />
      <Campo etiqueta="Material" value={material} onChangeText={setMaterial} placeholder="Cerámica, lítico, hueso…" />
      <Selector etiqueta="Tipo de pieza" opciones={tipos} valor={tipo} onChange={setTipo} />
      <Selector etiqueta="Periodo cultural" opciones={periodos} valor={periodo} onChange={setPeriodo} />
      <Selector etiqueta="Etiqueta" opciones={etiquetas} valor={etiqueta} onChange={setEtiqueta} opcional />
      <View style={styles.interruptor}>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Ficha pública</Text>
          <Text style={styles.ayuda}>Si está activa, quien escanee el QR verá la ficha de la pieza.</Text>
        </View>
        <Switch value={publica} onValueChange={setPublica} trackColor={{ true: colores.rojo }} />
      </View>
    </Formulario>
  );
}

const styles = StyleSheet.create({
  capa: { fontFamily: fuentes.textoMedio, fontSize: 14, color: colores.rojo, marginBottom: espacio.m },
  interruptor: { flexDirection: 'row', alignItems: 'center', gap: espacio.m, marginBottom: espacio.m },
  titulo: { fontFamily: fuentes.textoMedio, fontSize: 16, color: colores.tinta },
  ayuda: { fontFamily: fuentes.texto, fontSize: 13, color: colores.tintaSuave },
});
