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
