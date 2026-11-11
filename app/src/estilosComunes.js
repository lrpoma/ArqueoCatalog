import { StyleSheet } from 'react-native';

import { colores, espacio, fuentes } from './tema';

export const comunes = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.hueso },
  formulario: { padding: espacio.l, paddingBottom: espacio.xl * 2 },
  lista: { padding: espacio.m, paddingBottom: 96 }, // espacio para el botón flotante
  tarjeta: {
    backgroundColor: colores.blanco,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colores.linea,
    padding: espacio.m,
    marginBottom: espacio.s,
  },
  tarjetaTitulo: { fontFamily: fuentes.textoNegrita, fontSize: 17, color: colores.tinta },
  tarjetaTexto: { fontFamily: fuentes.texto, fontSize: 14, color: colores.tintaSuave, marginTop: 2 },
  errorGeneral: {
    fontFamily: fuentes.textoMedio,
    fontSize: 14,
    color: colores.rojo,
    backgroundColor: '#FDECEA',
    borderRadius: 10,
    padding: espacio.s + 4,
    marginBottom: espacio.m,
  },
  acciones: { gap: espacio.s, marginTop: espacio.m },
});
