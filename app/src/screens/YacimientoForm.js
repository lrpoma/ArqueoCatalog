import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { cliente, errorDeFormulario } from '../api/cliente';
import { ESTADOS_YACIMIENTO, useCatalogos } from '../catalogos/CatalogosContext';
import AvisoCatalogos from '../componentes/AvisoCatalogos';
import Boton from '../componentes/Boton';
import Campo from '../componentes/Campo';
import { Cargando } from '../componentes/Estados';
import Selector from '../componentes/Selector';
import { comunes } from '../estilosComunes';
import { aNumero } from '../utils/formato';

// Formulario mínimo de yacimiento: nombre, coordenadas, periodo y estado (la gestión completa está en el admin).
export default function YacimientoForm({ route, navigation }) {
  const id = route.params?.id;
  const catalogos = useCatalogos();
  const [cargando, setCargando] = useState(Boolean(id));
  const [guardando, setGuardando] = useState(false);
  const [general, setGeneral] = useState('');
  const [errores, setErrores] = useState({});
  const [f, setF] = useState({
    nombre: '',
    descripcion: '',
    latitud: '',
    longitud: '',
    periodo_cultural: null,
    estado: 'en_exploracion',
  });
  const poner = (campo) => (valor) => setF((previo) => ({ ...previo, [campo]: valor }));

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar yacimiento' : 'Nuevo yacimiento' });
    if (!id) return;
    cliente
      .get(`/yacimientos/${id}/`)
      .then(({ data }) =>
        setF({
          nombre: data.nombre,
          descripcion: data.descripcion,
          latitud: String(data.latitud),
          longitud: String(data.longitud),
          periodo_cultural: data.periodo_cultural,
          estado: data.estado,
        }),
      )
      .catch((e) => setGeneral(errorDeFormulario(e).general))
      .finally(() => setCargando(false));
  }, [id, navigation]);

  function validar() {
    const e = {};
    if (!f.nombre.trim()) e.nombre = 'Escribe el nombre.';
    const lat = aNumero(f.latitud);
    const lon = aNumero(f.longitud);
    if (f.latitud.trim() === '' || Number.isNaN(lat) || lat < -90 || lat > 90) e.latitud = 'Latitud entre -90 y 90 (ej. -16.5545).';
    if (f.longitud.trim() === '' || Number.isNaN(lon) || lon < -180 || lon > 180) e.longitud = 'Longitud entre -180 y 180 (ej. -68.6736).';
    if (!f.periodo_cultural) e.periodo_cultural = 'Selecciona el periodo.';
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
      latitud: aNumero(f.latitud),
      longitud: aNumero(f.longitud),
      periodo_cultural: f.periodo_cultural,
      estado: f.estado,
    };
    try {
      if (id) {
        await cliente.patch(`/yacimientos/${id}/`, carga);
        navigation.goBack();
      } else {
        const { data } = await cliente.post('/yacimientos/', carga);
        navigation.replace('YacimientoDetalle', { id: data.id });
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
        <Campo
          etiqueta="Latitud *"
          value={f.latitud}
          onChangeText={poner('latitud')}
          error={errores.latitud}
          keyboardType="numbers-and-punctuation"
          placeholder="-16.5545"
        />
        <Campo
          etiqueta="Longitud *"
          value={f.longitud}
          onChangeText={poner('longitud')}
          error={errores.longitud}
          keyboardType="numbers-and-punctuation"
          placeholder="-68.6736"
        />
        <Selector
          etiqueta="Periodo cultural *"
          valor={f.periodo_cultural}
          opciones={catalogos.periodos}
          onChange={poner('periodo_cultural')}
          error={errores.periodo_cultural}
        />
        <Selector etiqueta="Estado" valor={f.estado} opciones={ESTADOS_YACIMIENTO} onChange={poner('estado')} error={errores.estado} />
        <Campo etiqueta="Descripción" value={f.descripcion} onChangeText={poner('descripcion')} multilinea error={errores.descripcion} />
        <View style={comunes.acciones}>
          <Boton titulo={id ? 'Guardar cambios' : 'Crear yacimiento'} cargando={guardando} onPress={guardar} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
