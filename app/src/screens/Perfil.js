import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import Boton from '../componentes/Boton';
import Escalon from '../componentes/Escalon';
import { colores, espacio, fuentes } from '../tema';

const ROLES = { administrador: 'Administrador', investigador: 'Investigador' };

function Dato({ etiqueta, valor }) {
  return (
    <View style={styles.dato}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <Text style={styles.valor}>{valor || 'Sin dato'}</Text>
    </View>
  );
}

export default function Perfil() {
  const { usuario, cerrarSesion } = useAuth();
  const nombre = [usuario.first_name, usuario.last_name].filter(Boolean).join(' ') || usuario.username;

  return (
    <View style={styles.contenedor}>
      <View style={styles.cabecera}>
        <Text style={styles.titulo}>{nombre}</Text>
        <Text style={styles.subtitulo}>{ROLES[usuario.rol] ?? usuario.rol}</Text>
      </View>
      <Escalon />
      <View style={styles.cuerpo}>
        <Dato etiqueta="Usuario" valor={usuario.username} />
        <Dato etiqueta="Institución" valor={usuario.institucion?.nombre} />
        <Dato etiqueta="Correo" valor={usuario.email} />
        <View style={{ marginTop: espacio.xl }}>
          <Boton titulo="Cerrar sesión" variante="secundario" onPress={cerrarSesion} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: colores.hueso },
  cabecera: { backgroundColor: colores.rojo, padding: espacio.l, paddingTop: espacio.xl },
  titulo: { fontFamily: fuentes.titulo, fontSize: 30, color: colores.blanco },
  subtitulo: { fontFamily: fuentes.texto, fontSize: 15, color: '#FBE9E7', marginTop: espacio.xs },
  cuerpo: { padding: espacio.l },
  dato: { marginBottom: espacio.m },
  etiqueta: { fontFamily: fuentes.texto, fontSize: 13, color: colores.tintaSuave },
  valor: { fontFamily: fuentes.textoMedio, fontSize: 17, color: colores.tinta },
});
