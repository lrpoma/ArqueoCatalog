// Extiende app.json: el tráfico HTTP sin cifrar (usesCleartextTraffic) solo se permite cuando la
// URL del API NO es https (pruebas por LAN). Con el despliegue en HTTPS queda desactivado.
module.exports = ({ config }) => {
  const https = (process.env.EXPO_PUBLIC_API_URL ?? '').startsWith('https://');
  return {
    ...config,
    plugins: config.plugins.map((plugin) =>
      Array.isArray(plugin) && plugin[0] === 'expo-build-properties'
        ? [plugin[0], { android: { usesCleartextTraffic: !https } }]
        : plugin,
    ),
  };
};
