# Manual de despliegue — ArqueoCatalog en Dokploy 0.31.3

Arquitectura de cierre: **Cloudflare Tunnel → Traefik (Dokploy) → backend Django (Gunicorn) → PostgreSQL**.
Todo el tráfico externo entra por el túnel; el servidor no necesita puertos abiertos hacia internet.

> Respaldo garantizado: si algo del despliegue se complica, la demo corre con `docker compose up` en red local
> (ver README). El plan de recorte del proyecto permite dejar Dokploy como trabajo futuro.

Archivos del repositorio que usa esta guía:

| Archivo | Para qué |
|---|---|
| `docker-compose.dokploy.yml` | Compose de producción: sin `ports`, variables explícitas, volúmenes con nombre |
| `.env.example` | Lista de variables (bloque «Producción» al final) |
| `scripts/respaldo.sh`, `scripts/restaurar.sh` | Respaldo/restauración manual (plan B y pruebas) |
| `app/eas.json`, `app/app.config.js` | Perfil `production` de la app y bloqueo de HTTP sin cifrar |

---

## 0. Antes de empezar (checklist)

- [ ] Servidor Linux con Docker y Dokploy **0.31.3** instalado y accesible (panel en `http://IP:3000`).
- [ ] Un **dominio** en Cloudflare (aquí `lrpoma.site`) (el DNS debe estar gestionado por Cloudflare). Sirve uno de ~10 USD/año; los subdominios gratuitos tipo sslip.io **no sirven** para HTTPS.
- [ ] El repositorio subido a GitHub (público, o privado con la integración de GitHub de Dokploy).
- [ ] `docker-compose.dokploy.yml` está en la rama que vas a desplegar (`main`).
- [ ] Cuenta gratuita en Cloudflare R2 o Backblaze B2 para los respaldos (paso 7).

**Instalar o actualizar Dokploy.** Instalación nueva: `curl -sSL https://dokploy.com/install.sh | sh` (consulta la página de instalación oficial por si cambió). La 0.31.1 corrigió varias vulnerabilidades (inyección de comandos en backups y en `composePath`, entre otras), así que **no uses versiones anteriores a 0.31.1**; 0.31.3 es la última al 16-nov-2026.

---

## 1. Preparar variables de producción

Genera una `SECRET_KEY` y una contraseña de base de datos (en tu PC):

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(60))"   # SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(24))"   # POSTGRES_PASSWORD
```

Se usa **un solo dominio**, `arqueocatalog.lrpoma.site` (no hace falta `arqueocatalog.api.lrpoma.site`: el mismo backend sirve todo, y el certificado gratuito de Cloudflare cubre solo un nivel de subdominio, `*.lrpoma.site`). Con él (sirve la API, `/admin/`, la ficha pública y el `.apk`), las variables son:

```env
SECRET_KEY=<la generada>
ALLOWED_HOSTS=arqueocatalog.lrpoma.site
CSRF_TRUSTED_ORIGINS=https://arqueocatalog.lrpoma.site
PUBLIC_BASE_URL=https://arqueocatalog.lrpoma.site
CORS_ALLOWED_ORIGINS=
IP_CLIENTE_HEADER=CF-Connecting-IP
POSTGRES_DB=arqueocatalog
POSTGRES_USER=arqueocatalog
POSTGRES_PASSWORD=<la generada>
```

- `PUBLIC_BASE_URL` es obligatoria: con el túnel, Traefik recibe HTTP y Django no sabe que afuera es HTTPS; sin ella el **QR y las URLs de las fotos saldrían con `http://`**.
- `IP_CLIENTE_HEADER=CF-Connecting-IP` hace que el log de accesos y el throttling vean la IP real del cliente y no la del túnel. Es seguro **solo si nadie puede llegar a Traefik sin pasar por Cloudflare** (ver paso 9, firewall). Si dudas, déjala vacía.
- `CORS_ALLOWED_ORIGINS` vacío: la app móvil no es un navegador y no usa CORS.
- `DEBUG` no se configura: el compose la fija en `False`.

---

## 2. Cloudflare Tunnel (`cloudflared`)

1. Cloudflare → **Zero Trust → Networks → Connectors → Create a tunnel → Cloudflared**. Ponle nombre (`arqueocatalog`) y **copia el token**.
2. En Cloudflare → tu dominio → **SSL/TLS**: modo **Full** o **Full (strict)**. **No uses Flexible** (provoca bucles de redirección).
3. En Dokploy, dentro de un proyecto (p. ej. `infraestructura`): **Create Service → Application**.
   - Provider: **Docker**, imagen `cloudflare/cloudflared`.
   - Pestaña **Environment**: `TUNNEL_TOKEN="<el token copiado>"`.
   - **Advanced → Arguments**: agrega `tunnel` y luego `run` (dos argumentos, en ese orden).
   - **Deploy** y confirma que el contenedor queda *healthy*.
4. En Cloudflare, en el túnel → **Published application routes → Add**:
   - Subdominio + dominio: `arqueocatalog` + `lrpoma.site`
   - Service: **HTTP**, URL: `dokploy-traefik:80`

> Fuente: guía oficial de Dokploy para Cloudflare Tunnels. Con túnel **no** actives Let's Encrypt ni HTTPS en Dokploy: Cloudflare termina el TLS y Traefik habla HTTP internamente.

---

## 3. Crear la aplicación Compose

1. Dokploy → proyecto `arqueocatalog` (nuevo) → **Create Service → Compose**.
2. Pestaña **General** → Provider **GitHub** (o Git):
   - Repository: `tu-usuario/ArqueoCatalog`
   - Branch: `main`
   - **Compose Path**: `./docker-compose.dokploy.yml`
   - Compose Type: **Docker Compose**
3. Pestaña **Environment**: pega las variables del paso 1 (formato `CLAVE=valor`, una por línea) y **Save**.
   - Dokploy las escribe en un `.env` junto al compose; el compose las lee con `${VARIABLE}` y las pasa a los contenedores. Si el despliegue falla con «definir SECRET_KEY» es que falta alguna.
4. Pestaña **Domains → Add Domain**:
   - **Service Name**: `backend`
   - **Host**: `arqueocatalog.lrpoma.site`
   - **Container Port**: `8000`
   - **HTTPS**: **desactivado** (certificado *None*), porque el HTTPS lo pone Cloudflare.
   - Guardar. En Compose, **cambiar un dominio exige redesplegar**.
5. Pestaña **General → Deploy**. Sigue el log en **Deployments**. El `entrypoint.sh` ejecuta `migrate` y `collectstatic` solo en cada arranque.
6. (Opcional) **Preview Compose** muestra el compose final con las etiquetas de Traefik y las redes que Dokploy agrega.

Verifica:

```bash
curl https://arqueocatalog.lrpoma.site/api/v1/health/      # {"estado": "ok"}
```

---

## 4. Primer uso: administrador y datos

Abre una terminal en el contenedor del backend: Dokploy → **Docker → Containers →** (contenedor `backend` de tu app) **→ Terminal**; o por SSH: `docker exec -it <contenedor> sh`.

```bash
python manage.py createsuperuser        # queda con rol «administrador» automáticamente
```

Luego entra a `https://arqueocatalog.lrpoma.site/admin/` y carga desde el panel: instituciones, periodos culturales, tipos de pieza y etiquetas, y los usuarios investigadores (ver `docs/FUENTES_DATOS.md` para de dónde sacar los datos).

Atajo para una demo rápida, con datos de ejemplo del proyecto:

```bash
python manage.py cargar_datos_ejemplo --password 'UnaClaveLargaYUnica'
```

> `cargar_datos_ejemplo` crea los usuarios `admin` e `investigador` con la contraseña indicada. **No uses la contraseña por defecto en un servidor público.** Después de la demo, desactiva o cambia esos usuarios.

---

## 5. Publicar el `.apk` para descarga

El endpoint `GET /api/v1/app/descargar.apk` entrega el archivo `/app/media/app/arqueocatalog.apk` (volumen `media`, no la imagen). Súbelo por SSH desde donde tengas el `.apk`:

```bash
CONT=$(docker ps --format '{{.Names}}' | grep backend)       # nombre del contenedor
docker exec "$CONT" mkdir -p /app/media/app
docker cp ArqueoCatalog.apk "$CONT":/app/media/app/arqueocatalog.apk
curl -I https://arqueocatalog.lrpoma.site/api/v1/app/descargar.apk   # 200
```

Mientras no exista el archivo el endpoint responde 404. El archivo vive en el volumen, así que un redespliegue **no lo borra**.

---

## 6. Compilar la app contra el servidor

1. En `app/eas.json`, perfil `production`: ya apunta a `https://arqueocatalog.lrpoma.site/api/v1`; cámbialo solo si usas otro dominio.
2. `app/app.config.js` desactiva solo `usesCleartextTraffic` cuando la URL es `https://`, así que no hay que tocar `app.json`.
3. Sube `android.versionCode` en `app/app.json` (hoy 2) si vas a reemplazar una instalación previa.
4. Compila:

```bash
cd app
eas build -p android --profile production            # cola gratuita de EAS
# alternativa sin cola (requiere JDK 17 y Android SDK):
eas build -p android --profile production --local
```

5. Descarga el `.apk`, instálalo en un celular **distinto al de desarrollo** y pruébalo (login, pieza, foto, QR). Luego súbelo con el paso 5.

---

## 7. Respaldos automáticos (base de datos + fotos)

Crea un destino S3 una sola vez: Dokploy → **Settings → S3 Destinations** (`/dashboard/settings/destinations`).

**Cloudflare R2** (10 GB gratis): R2 → *Create bucket* → *Manage API tokens* → token con permiso **Object Read & Write** limitado al bucket. En Dokploy: Access Key Id, Secret Access Key, Region (`auto`, o la que indique R2), Endpoint `https://<id>.r2.cloudflarestorage.com`, Bucket. Pulsa **Test the connection**.
**Backblaze B2** (10 GB gratis): bucket + *Application Key* con Read & Write; Endpoint tipo `https://s3.us-west-002.backblazeb2.com`.

> Las etiquetas de los campos pueden variar un poco en la interfaz real; confirma en el formulario.

### 7.1 Base de datos (pestaña **Backups** de la app Compose)

- **Destination**: el S3 creado · **Database Type**: PostgreSQL · **Service Name**: `db`
- **Database**: `arqueocatalog` · **Schedule**: `0 3 * * *` (diario 03:00) · **Keep the latest**: `14`
- Guarda y pulsa **Run Manual Backup**; confirma que aparece el archivo en el bucket.

### 7.2 Fotos (pestaña **Volume Backups**)

Solo funciona con volúmenes *con nombre* (por eso el compose usa `media:`, no una carpeta del host).

- **Service Name**: `backend` · **Volume Name**: `media` · **Schedule**: `30 3 * * *`
- **Turn off Container**: opcional; evita copias inconsistentes pero detiene el backend un instante (a las 03:30 no importa).

### 7.3 Prueba de restauración (entregable del Sprint 4)

El plan exige **una restauración probada**. Hazla una vez y guarda capturas como evidencia:

1. Ejecuta el respaldo manual (7.1) y confirma el archivo en el bucket.
2. **Restaurar la base** desde la misma pestaña Backups (opción *Restore* del respaldo elegido). Requisito: la base debe existir y el destino ser el servicio `db`. *(No leí la página oficial de restauración; sigue lo que muestre la interfaz.)*
3. **Restaurar fotos**: Volume Backups → **Restore Volume** → elegir el respaldo → nombre del volumen destino. Dokploy exige que el volumen destino **no exista** y que los contenedores que lo usan estén **parados**.
4. Comprueba `/api/v1/health/`, abre una pieza con foto y revisa el panel admin.

**Plan B probado localmente** (Docker Compose, sin Dokploy): `./scripts/respaldo.sh ./respaldos` genera `db-*.dump` y `media-*.tar.gz`; `./scripts/restaurar.sh <db.dump> <media.tar.gz>` los restaura. Se verificó restaurando el dump en una base desechable (recuperó las piezas y usuarios).

---

## 8. Despliegue automático desde GitHub (opcional)

Compose → **General → Auto Deploy** activado. La rama configurada en Dokploy debe coincidir con la rama a la que haces `push` (si no, aparece *Branch Not Match*). Si no se dispara con la integración de GitHub, copia la **Webhook URL** de la pestaña **Deployments** en *GitHub → Settings → Webhooks*.

---

## 9. Seguridad (checklist de cierre)

- [ ] `DEBUG=False` (fijado en el compose), `ALLOWED_HOSTS` y `CSRF_TRUSTED_ORIGINS` solo con tu dominio.
- [ ] `.env` nunca en Git (está en `.gitignore`); los secretos viven solo en la pestaña Environment de Dokploy.
- [ ] El backend **no publica puertos** (usa `expose`); solo Traefik lo alcanza.
- [ ] **Firewall del servidor**: bloquea 80 y 443 desde internet (el túnel sale hacia afuera, no necesita puertos entrantes) y restringe el 3000 del panel de Dokploy a tu IP/VPN. Esto es lo que hace seguro `IP_CLIENTE_HEADER`.
- [ ] Contenedor del backend sin root (`USER appuser` en el Dockerfile).
- [ ] Usuarios de ejemplo con contraseña fuerte o desactivados.
- [ ] Respaldo diario activo y una restauración probada.

---

## 10. Pruebas de aceptación en el servidor

| Prueba | Esperado |
|---|---|
| `curl https://dominio/api/v1/health/` | 200 `{"estado":"ok"}` |
| Login en `/admin/` con el superusuario | Entra sin error 403 de CSRF; aparece un registro en *Log de accesos* con **tu IP real** |
| Login desde la app (APK) | Entra y lista yacimientos |
| Crear pieza + subir foto + ver QR | El QR apunta a `https://dominio/api/v1/public/piezas/ARQ-…/` |
| Escanear el QR con otro celular | 200 si la pieza es pública; pantalla «Ficha restringida» (403) si no; 404 si el código no existe |
| `curl -I https://dominio/api/v1/app/descargar.apk` | 200 con el `.apk` |
| Reiniciar el servidor | La app vuelve sola; los datos y las fotos siguen |

---

## 11. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `Invalid HTTP_HOST` / 400 | El dominio no está en `ALLOWED_HOSTS`. |
| 403 *CSRF verification failed* al entrar a `/admin/` | Falta `CSRF_TRUSTED_ORIGINS=https://tu-dominio` (con `https://`). |
| Bucle de redirecciones (`ERR_TOO_MANY_REDIRECTS`) | SSL/TLS de Cloudflare en *Flexible* → ponlo en **Full**; y no actives HTTPS/Let's Encrypt en el dominio de Dokploy. |
| 502/504 | La ruta del túnel no apunta a `dokploy-traefik:80`, o el dominio de Dokploy no tiene el puerto `8000`/servicio `backend`. |
| El QR trae `http://` | Falta `PUBLIC_BASE_URL` o se escribió sin `https://`. |
| El despliegue falla con «definir X» | Esa variable falta en Environment (el compose las exige). |
| Variables definidas pero el contenedor no las ve | En Compose, Dokploy solo escribe el `.env`; el compose debe pasarlas con `environment:` (ya lo hace `docker-compose.dokploy.yml`). |
| Fotos no se guardan / «Permission denied» | El volumen `media` debe ser de `appuser`; si usaste una carpeta del host, cámbiala por el volumen con nombre. |
| Todos los usuarios aparecen con la misma IP / throttling compartido | Falta `IP_CLIENTE_HEADER=CF-Connecting-IP`. |
| El `.apk` no abre la sesión | La URL de `eas.json` no coincide con el dominio, o se compiló con el perfil `preview` (LAN). |

---

## Fuentes oficiales consultadas

- Dokploy · Docker Compose y dominios: <https://docs.dokploy.com/docs/core/docker-compose> · <https://docs.dokploy.com/docs/core/docker-compose/domains>
- Dokploy · Cloudflare Tunnels: <https://docs.dokploy.com/docs/core/guides/cloudflare-tunnels>
- Dokploy · Volume Backups: <https://docs.dokploy.com/docs/core/volume-backups>
- Dokploy · Backups de bases de datos: <https://docs.dokploy.com/docs/core/databases/backups>
- Dokploy · Cloudflare R2: <https://docs.dokploy.com/docs/core/cloudflare-r2> · Backblaze B2: <https://docs.dokploy.com/docs/core/backblaze-b2>
- Dokploy · Auto Deploy: <https://docs.dokploy.com/docs/core/auto-deploy>
- Dokploy · Releases: <https://github.com/Dokploy/dokploy/releases>
