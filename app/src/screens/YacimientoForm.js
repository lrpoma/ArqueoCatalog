import { useState } from 'react';

import { cliente, mensajeDeGuardado } from '../api/cliente';
import Campo from '../componentes/Campo';
import Formulario from '../componentes/Formulario';
import Selector from '../componentes/Selector';
import { useCatalogos } from '../catalogos/CatalogosContext';
import { ESTADOS_YACIMIENTO } from './opciones';

// Formulario mínimo: nombre, coordenadas escritas a mano (nunca del EXIF), periodo y estado.
export default function YacimientoForm({ navigation, route }) {
  const previo = route.params?.yacimiento;
  const { periodos } = useCatalogos();
  const [nombre, setNombre] = useState(previo?.nombre ?? '');
  const [latitud, setLatitud] = useState(previo ? String(previo.latitud) : '');
  const [longitud, setLongitud] = useState(previo ? String(previo.longitud) : '');
  const [periodo, setPeriodo] = useState(previo?.periodo_cultural ?? null);
  const [estado, setEstado] = useState(previo?.estado ?? 'en_exploracion');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const lat = Number(latitud.replace(',', '.'));
    const lon = Number(longitud.replace(',', '.'));
    if (!nombre.trim() || !periodo || !latitud.trim() || !longitud.trim()) {
      setError('Completa nombre, coordenadas y periodo cultural.');
      return;
    }
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      setError('Las coordenadas deben ser números, por ejemplo -16.5543.');
      return;
    }
    setError('');
    setGuardando(true);
    const cuerpo = { nombre: nombre.trim(), latitud: lat, longitud: lon, periodo_cultural: periodo, estado };
    try {
      if (previo) await cliente.patch(`/yacimientos/${previo.id}/`, cuerpo);
      else await cliente.post('/yacimientos/', cuerpo);
      navigation.goBack();
    } catch (e) {
      setError(mensajeDeGuardado(e));
      setGuardando(false);
    }
  }

  return (
    <Formulario onGuardar={guardar} guardando={guardando} error={error}>
      <Campo etiqueta="Nombre" value={nombre} onChangeText={setNombre} />
      <Campo etiqueta="Latitud" value={latitud} onChangeText={setLatitud} keyboardType="numbers-and-punctuation" placeholder="-16.5543" />
      <Campo etiqueta="Longitud" value={longitud} onChangeText={setLongitud} keyboardType="numbers-and-punctuation" placeholder="-68.6735" />
      <Selector etiqueta="Periodo cultural" opciones={periodos} valor={periodo} onChange={setPeriodo} />
      <Selector etiqueta="Estado" opciones={ESTADOS_YACIMIENTO} valor={estado} onChange={setEstado} />
    </Formulario>
  );
}
