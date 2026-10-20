# Generar e instalar el .apk

1. Apuntar la app al servidor: `EXPO_PUBLIC_API_URL=https://<dominio>/api/v1` (en `eas.json`, perfil `preview`,
   bloque `env`, o al ejecutar el comando).
2. Compilar:
   ```bash
   cd app
   eas build -p android --profile preview          # cola de EAS
   eas build -p android --profile preview --local  # alternativa si la cola demora (requiere Android SDK)
   ```
3. Publicar el instalador en el servidor para descargarlo desde el celular:
   ```bash
   docker compose cp arqueocatalog.apk backend:/app/media/app/arqueocatalog.apk
   ```
   (crear antes la carpeta: `docker compose exec backend mkdir -p /app/media/app`).
   Queda en `GET /api/v1/app/descargar.apk`.
4. En el celular: permitir la instalación de orígenes desconocidos, descargar e instalar. **Hacerlo varios días antes
   de la demo**, en un celular distinto al de desarrollo.
