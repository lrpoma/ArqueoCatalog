# ArqueoCatalog

Sistema web-móvil para catalogar, dar trazabilidad y gestionar hallazgos arqueológicos (UMSA · Ingeniería de Sistemas).
Detalle completo en `Propuesta_ArqueoCatalog_v4.md` y reglas de trabajo en `CLAUDE.md`.

## Estructura

```
backend/   Django 5 + DRF (apps: usuarios, catalogos, yacimientos, piezas, nucleo)
app/       Expo / React Native (Android)
docker-compose.yml   PostgreSQL 16 + backend
.env.example
```

## Puesta en marcha (backend)

```bash
cp .env.example .env        # y cambiar SECRET_KEY y POSTGRES_PASSWORD
docker compose up --build -d
docker compose exec backend python manage.py cargar_datos_ejemplo   # catálogos y usuarios de ejemplo
# o: docker compose exec backend python manage.py createsuperuser
```

- Panel admin: http://localhost:8000/admin/ (usuarios de ejemplo: `admin` / `investigador`)
- Salud: http://localhost:8000/api/v1/health/

## Calidad

```bash
docker compose exec backend pytest
docker compose exec backend ruff check .
cd app && npx eslint .
```

Migraciones nuevas (los archivos quedan en el host):

```bash
docker compose run --rm --no-deps --entrypoint "" -v ./backend:/app backend python manage.py makemigrations
```

## App (APK)

Se desarrolla probando directamente con el `.apk` (build `preview` de EAS), sin Expo Go.

```bash
cd app && npm install
npm i -g eas-cli && eas login          # una sola vez (cuenta gratuita de expo.dev)
eas init                               # una sola vez: enlaza el proyecto con tu cuenta
eas build -p android --profile preview # genera el .apk (descargar e instalar en el celular)
```

- La URL del API se fija **al compilar**: `eas.json` → `build.preview.env.EXPO_PUBLIC_API_URL`
  (hoy `http://192.168.1.14:8001/api/v1`). Si cambia la IP de la PC, actualizarla ahí, agregarla a
  `ALLOWED_HOSTS` en `.env` y volver a compilar.
- El celular debe estar en la misma WiFi que la PC y el firewall debe permitir el puerto del backend.
- `app.json` habilita tráfico HTTP (`usesCleartextTraffic`) solo para pruebas por LAN; con el despliegue
  en HTTPS (túnel) se debe quitar.
- Alternativa local sin cola de EAS: `eas build -p android --profile preview --local` (requiere JDK 17 y Android SDK).

## API (Sprint 2)

Base `/api/v1/`, `Authorization: Bearer <access>` salvo login y ficha pública.

| Endpoint | Notas |
|---|---|
| `POST /auth/login/`, `POST /auth/refresh/`, `GET /auth/me/` | Login devuelve `access`, `refresh` y `usuario`; limitado a 10/min |
| `/yacimientos/`, `/yacimientos/{id}/capas/`, `/piezas/` | CRUD paginado; búsqueda `?search=`, filtros `periodo_cultural`, `estado`, `tipo_pieza`, `etiqueta`, `capa`, `yacimiento`, `publica` |
| `GET /piezas/{id}/historial/` | Solo lectura; lo llenan las señales |
| `GET /catalogos/{periodos,tipos,etiquetas}/` | Solo lectura, sin paginar (alimentan selectores) |

`DELETE` desactiva (`activo=False`) y solo lo permite el rol Administrador.

### Fotos, QR y ficha pública (Sprint 3)

| Endpoint | Notas |
|---|---|
| `GET/POST /piezas/{id}/fotos/` | POST multipart con el campo `archivo` (JPEG/PNG/WebP, máx. 5 MB). Se re-codifica a JPEG **sin EXIF/GPS**, se limita a 2048 px y se genera miniatura. La primera foto queda como principal |
| `GET /media/{foto_id}/` | Entrega la imagen con control de visibilidad: personal autenticado ve cualquier foto de una pieza activa; anónimos solo si la pieza es pública; si no, 404. `?miniatura=1` para la miniatura |
| `GET /piezas/{id}/qr/` | PNG del QR que apunta a `/api/v1/public/piezas/{codigo}/` (el host sale de la petición) |
| `GET /public/piezas/{codigo}/` | Ficha pública web: 200 si es pública, 403 «Ficha restringida» si no, 404 si no existe |

