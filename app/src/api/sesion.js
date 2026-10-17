import * as SecureStore from 'expo-secure-store';

// Los tokens van en el almacén seguro del celular, nunca en AsyncStorage.
const CLAVE_ACCESS = 'arqueocatalog.access';
const CLAVE_REFRESH = 'arqueocatalog.refresh';

export async function guardarTokens({ access, refresh }) {
  await SecureStore.setItemAsync(CLAVE_ACCESS, access);
  if (refresh) await SecureStore.setItemAsync(CLAVE_REFRESH, refresh);
}

export const leerAccess = () => SecureStore.getItemAsync(CLAVE_ACCESS);
export const leerRefresh = () => SecureStore.getItemAsync(CLAVE_REFRESH);

export async function borrarTokens() {
  await SecureStore.deleteItemAsync(CLAVE_ACCESS);
  await SecureStore.deleteItemAsync(CLAVE_REFRESH);
}
