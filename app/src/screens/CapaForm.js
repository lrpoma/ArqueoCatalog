import { useState } from 'react';

import { cliente, mensajeDeGuardado } from '../api/cliente';
import Campo from '../componentes/Campo';
import Formulario from '../componentes/Formulario';

const aNumero = (texto) => (texto.trim() === '' ? NaN : Number(texto.replace(',', '.')));

export default function CapaForm({ navigation, route }) {
  const { yacimientoId, capa: previa } = route.params;
  const [codigo, setCodigo] = useState(previa?.codigo ?? '');
  const [desde, setDesde] = useState(previa ? String(previa.profundidad_desde) : '');
  const [hasta, setHasta] = useState(previa ? String(previa.profundidad_hasta) : '');
  const [descripcion, setDescripcion] = useState(previa?.descripcion ?? '');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const d = aNumero(desde);
    const h = aNumero(hasta);
    if (!codigo.trim() || Number.isNaN(d) || Number.isNaN(h)) {
      setError('Indica el código y las profundidades en metros.');
      return;
    }
    if (h < d) {
      setError('La profundidad final debe ser mayor o igual a la inicial.');
      return;
    }
    setError('');
    setGuardando(true);
    const cuerpo = { codigo: codigo.trim(), profundidad_desde: d, profundidad_hasta: h, descripcion };
    try {
      const base = `/yacimientos/${yacimientoId}/capas/`;
      if (previa) await cliente.patch(`${base}${previa.id}/`, cuerpo);
      else await cliente.post(base, cuerpo);
      navigation.goBack();
    } catch (e) {
      setError(mensajeDeGuardado(e));
      setGuardando(false);
    }
  }

  return (
    <Formulario onGuardar={guardar} guardando={guardando} error={error}>
      <Campo etiqueta="Código de la capa" value={codigo} onChangeText={setCodigo} autoCapitalize="characters" placeholder="C-01" />
      <Campo etiqueta="Profundidad desde (m)" value={desde} onChangeText={setDesde} keyboardType="decimal-pad" />
      <Campo etiqueta="Profundidad hasta (m)" value={hasta} onChangeText={setHasta} keyboardType="decimal-pad" />
      <Campo etiqueta="Descripción" value={descripcion} onChangeText={setDescripcion} multilinea />
    </Formulario>
  );
}
