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

## App (desarrollo)

```bash
cd app && npm install
EXPO_PUBLIC_API_URL=http://<IP-de-tu-PC>:8000/api/v1 npx expo start   # escanear con Expo Go
```

## API (Sprint 2)

Base `/api/v1/`, `Authorization: Bearer <access>` salvo login y ficha pública.

| Endpoint | Notas |
|---|---|
| `POST /auth/login/`, `POST /auth/refresh/`, `GET /auth/me/` | Login devuelve `access`, `refresh` y `usuario`; limitado a 10/min |
| `/yacimientos/`, `/yacimientos/{id}/capas/`, `/piezas/` | CRUD paginado; búsqueda `?search=`, filtros `periodo_cultural`, `estado`, `tipo_pieza`, `etiqueta`, `capa`, `yacimiento`, `publica` |
| `GET /piezas/{id}/historial/` | Solo lectura; lo llenan las señales |
| `POST /piezas/{id}/fotos/` | Multipart (`archivo`); JPEG/PNG/WEBP ≤ 8 MB; quita EXIF/GPS y genera miniatura |
| `GET /piezas/{id}/qr/` | PNG con la URL de la ficha pública (`URL_PUBLICA` define la base) |
| `GET /media/{foto_id}/` | Foto (`?miniatura=1`); anónimos solo si la pieza es pública y activa |
| `GET /public/piezas/{codigo}/` | Ficha web: 200 / 403 / 404 |
| `GET /catalogos/{periodos,tipos,etiquetas}/` | Solo lectura, sin paginar (alimentan selectores) |

`DELETE` desactiva (`activo=False`) y solo lo permite el rol Administrador.

## Despliegue

Primer intento en Dokploy: ver `docs/despliegue-dokploy.md` (usa `docker-compose.dokploy.yml`).
