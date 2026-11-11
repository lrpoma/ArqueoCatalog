import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Switch, Text, View } from 'react-native';

import { cliente, errorDeFormulario } from '../api/cliente';
import { useCatalogos } from '../catalogos/CatalogosContext';
import AvisoCatalogos from '../componentes/AvisoCatalogos';
import Boton from '../componentes/Boton';
import Campo from '../componentes/Campo';
import { Cargando } from '../componentes/Estados';
import Selector from '../componentes/Selector';
import { comunes } from '../estilosComunes';
import { listarTodo } from '../hooks/useLista';
import { colores, espacio, fuentes } from '../tema';

// Alta y edición de pieza. La procedencia se elige como yacimiento → capa (la pieza guarda solo la capa).
export default function PiezaForm({ route, navigation }) {
  const { id, capaId, yacimientoId } = route.params ?? {};
  const catalogos = useCatalogos();
  const [cargando, setCargando] = useState(Boolean(id));
  const [guardando, setGuardando] = useState(false);
  const [general, setGeneral] = useState('');
  const [errores, setErrores] = useState({});
  const [yacimientos, setYacimientos] = useState([]);
  const [capas, setCapas] = useState({ yacimiento: null, lista: [] }); // capas del yacimiento indicado
  const [f, setF] = useState({
    nombre: '',
    descripcion: '',
    material: '',
    tipo_pieza: null,
    periodo_cultural: null,
    etiqueta: null,
    yacimiento: yacimientoId ?? null,
    capa: capaId ?? null,
    publica: false,
  });
  const poner = (campo) => (valor) => setF((previo) => ({ ...previo, [campo]: valor }));

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar pieza' : 'Nueva pieza' });
    listarTodo('/yacimientos/')
      .then((lista) => setYacimientos(lista.map((y) => ({ id: y.id, nombre: y.nombre }))))
      .catch((e) => setGeneral(errorDeFormulario(e).general));
    if (!id) return;
    cliente
      .get(`/piezas/${id}/`)
      .then(({ data }) =>
        setF({
          nombre: data.nombre,
          descripcion: data.descripcion,
          material: data.material,
          tipo_pieza: data.tipo_pieza,
          periodo_cultural: data.periodo_cultural,
          etiqueta: data.etiqueta,
          yacimiento: data.yacimiento,
          capa: data.capa,
          publica: data.publica,
        }),
      )
      .catch((e) => setGeneral(errorDeFormulario(e).general))
      .finally(() => setCargando(false));
  }, [id, navigation]);

  // Las capas dependen del yacimiento elegido.
  useEffect(() => {
    if (!f.yacimiento) return;
    let vigente = true;
    const yacimiento = f.yacimiento;
    listarTodo(`/yacimientos/${yacimiento}/capas/`)
      .then(
        (lista) =>
          vigente && setCapas({ yacimiento, lista: lista.map((c) => ({ id: c.id, nombre: `Capa ${c.codigo}` })) }),
      )
      .catch((e) => vigente && setGeneral(errorDeFormulario(e).general));
    return () => {
      vigente = false;
    };
  }, [f.yacimiento]);

  // Si el yacimiento cambió y las capas nuevas aún no llegaron, no se ofrecen las del anterior.
  const opcionesCapa = capas.yacimiento === f.yacimiento ? capas.lista : [];

  function validar() {
    const e = {};
    if (!f.nombre.trim()) e.nombre = 'Escribe el nombre.';
    if (!f.tipo_pieza) e.tipo_pieza = 'Selecciona el tipo.';
    if (!f.periodo_cultural) e.periodo_cultural = 'Selecciona el periodo.';
    if (!f.yacimiento) e.yacimiento = 'Selecciona el yacimiento.';
    else if (!f.capa) e.capa = 'Selecciona la capa de procedencia.';
    return e;
  }

  async function guardar() {
    const e = validar();
    setErrores(e);
    setGeneral('');
    if (Object.keys(e).length) return;
    setGuardando(true);
    const carga = {
      nombre: f.nombre.trim(),
      descripcion: f.descripcion.trim(),
      material: f.material.trim(),
      tipo_pieza: f.tipo_pieza,
      periodo_cultural: f.periodo_cultural,
      etiqueta: f.etiqueta,
      capa: f.capa,
      publica: f.publica,
    };
    try {
      if (id) {
        await cliente.patch(`/piezas/${id}/`, carga);
        navigation.goBack();
      } else {
        const { data } = await cliente.post('/piezas/', carga);
        navigation.replace('PiezaDetalle', { id: data.id });
      }
    } catch (error) {
      const r = errorDeFormulario(error);
      setGeneral(r.general);
      setErrores(r.campos);
      setGuardando(false);
    }
  }

  if (cargando) return <Cargando />;

  return (
    <KeyboardAvoidingView style={comunes.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={comunes.formulario} keyboardShouldPersistTaps="handled">
        <AvisoCatalogos />
        {general ? <Text style={comunes.errorGeneral}>{general}</Text> : null}
        <Campo etiqueta="Nombre *" value={f.nombre} onChangeText={poner('nombre')} error={errores.nombre} maxLength={200} />
        <Selector etiqueta="Tipo de pieza *" valor={f.tipo_pieza} opciones={catalogos.tipos} onChange={poner('tipo_pieza')} error={errores.tipo_pieza} />
        <Selector
          etiqueta="Periodo cultural *"
          valor={f.periodo_cultural}
          opciones={catalogos.periodos}
          onChange={poner('periodo_cultural')}
          error={errores.periodo_cultural}
        />
        <Selector etiqueta="Etiqueta" valor={f.etiqueta} opciones={catalogos.etiquetas} onChange={poner('etiqueta')} opcional error={errores.etiqueta} />
        <Selector
          etiqueta="Yacimiento *"
          valor={f.yacimiento}
          opciones={yacimientos}
          onChange={(valor) => setF((previo) => ({ ...previo, yacimiento: valor, capa: null }))}
          error={errores.yacimiento}
        />
        <Selector
          etiqueta="Capa estratigráfica *"
          valor={f.capa}
          opciones={opcionesCapa}
          onChange={poner('capa')}
          deshabilitado={!f.yacimiento}
          vacio="Este yacimiento aún no tiene capas."
          error={errores.capa}
        />
        <Campo etiqueta="Material" value={f.material} onChangeText={poner('material')} error={errores.material} maxLength={100} />
        <Campo etiqueta="Descripción" value={f.descripcion} onChangeText={poner('descripcion')} multilinea error={errores.descripcion} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: espacio.m }}>
          <View style={{ flex: 1, paddingRight: espacio.m }}>
            <Text style={{ fontFamily: fuentes.textoMedio, fontSize: 16, color: colores.tinta }}>Ficha pública</Text>
            <Text style={{ fontFamily: fuentes.texto, fontSize: 13, color: colores.tintaSuave }}>
              Si está activa, quien escanee el QR verá los datos de la pieza.
            </Text>
          </View>
          <Switch
            value={f.publica}
            onValueChange={poner('publica')}
            trackColor={{ false: colores.linea, true: colores.ocre }}
            thumbColor={f.publica ? colores.rojo : colores.blanco}
          />
        </View>
        <View style={comunes.acciones}>
          <Boton titulo={id ? 'Guardar cambios' : 'Registrar pieza'} cargando={guardando} onPress={guardar} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
