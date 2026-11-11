import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { cliente, errorDeFormulario } from '../api/cliente';
import Boton from '../componentes/Boton';
import Campo from '../componentes/Campo';
import { Cargando } from '../componentes/Estados';
import { comunes } from '../estilosComunes';
import { aNumero } from '../utils/formato';

export default function CapaForm({ route, navigation }) {
  const { yacimientoId, id } = route.params;
  const [cargando, setCargando] = useState(Boolean(id));
  const [guardando, setGuardando] = useState(false);
  const [general, setGeneral] = useState('');
  const [errores, setErrores] = useState({});
  const [f, setF] = useState({ codigo: '', profundidad_desde: '', profundidad_hasta: '', descripcion: '' });
  const poner = (campo) => (valor) => setF((previo) => ({ ...previo, [campo]: valor }));
  const ruta = `/yacimientos/${yacimientoId}/capas/`;

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar capa' : 'Nueva capa' });
    if (!id) return;
    cliente
      .get(`${ruta}${id}/`)
      .then(({ data }) =>
        setF({
          codigo: data.codigo,
          profundidad_desde: String(data.profundidad_desde),
          profundidad_hasta: String(data.profundidad_hasta),
          descripcion: data.descripcion,
        }),
      )
      .catch((e) => setGeneral(errorDeFormulario(e).general))
      .finally(() => setCargando(false));
  }, [id, ruta, navigation]);

  function validar() {
    const e = {};
    if (!f.codigo.trim()) e.codigo = 'Escribe el código (ej. C-01).';
    const desde = aNumero(f.profundidad_desde);
    const hasta = aNumero(f.profundidad_hasta);
    if (f.profundidad_desde.trim() === '' || Number.isNaN(desde) || desde < 0) e.profundidad_desde = 'Profundidad en metros (0 o más).';
    if (f.profundidad_hasta.trim() === '' || Number.isNaN(hasta) || hasta < 0) e.profundidad_hasta = 'Profundidad en metros (0 o más).';
    else if (!e.profundidad_desde && hasta < desde) e.profundidad_hasta = 'Debe ser mayor o igual a la inicial.';
    return e;
  }

  async function guardar() {
    const e = validar();
    setErrores(e);
    setGeneral('');
    if (Object.keys(e).length) return;
    setGuardando(true);
    const carga = {
      codigo: f.codigo.trim(),
      profundidad_desde: aNumero(f.profundidad_desde),
      profundidad_hasta: aNumero(f.profundidad_hasta),
      descripcion: f.descripcion.trim(),
    };
    try {
      if (id) {
        await cliente.patch(`${ruta}${id}/`, carga);
        navigation.goBack();
      } else {
        const { data } = await cliente.post(ruta, carga);
        navigation.replace('CapaDetalle', { yacimientoId, id: data.id });
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
        {general ? <Text style={comunes.errorGeneral}>{general}</Text> : null}
        <Campo etiqueta="Código *" value={f.codigo} onChangeText={poner('codigo')} error={errores.codigo} autoCapitalize="characters" maxLength={50} />
        <Campo
          etiqueta="Profundidad desde (m) *"
          value={f.profundidad_desde}
          onChangeText={poner('profundidad_desde')}
          error={errores.profundidad_desde}
          keyboardType="numbers-and-punctuation"
          placeholder="0.0"
        />
        <Campo
          etiqueta="Profundidad hasta (m) *"
          value={f.profundidad_hasta}
          onChangeText={poner('profundidad_hasta')}
          error={errores.profundidad_hasta}
          keyboardType="numbers-and-punctuation"
          placeholder="0.5"
        />
        <Campo etiqueta="Descripción" value={f.descripcion} onChangeText={poner('descripcion')} multilinea error={errores.descripcion} />
        <View style={comunes.acciones}>
          <Boton titulo={id ? 'Guardar cambios' : 'Crear capa'} cargando={guardando} onPress={guardar} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
