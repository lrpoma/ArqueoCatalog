import { Text, View } from 'react-native';

import { useCatalogos } from '../catalogos/CatalogosContext';
import { comunes } from '../estilosComunes';
import Boton from './Boton';

// Si los catálogos no cargaron, los selectores quedarían vacíos: se avisa y se permite reintentar.
export default function AvisoCatalogos() {
  const { error, cargando, recargar } = useCatalogos();
  if (!error) return null;
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={comunes.errorGeneral}>No se pudieron cargar los catálogos (periodos, tipos, etiquetas).</Text>
      <Boton titulo="Reintentar" variante="secundario" cargando={cargando} onPress={recargar} />
    </View>
  );
}
