# CLAUDE.md — ArqueoCatalog

Sistema de información web-móvil para catalogar, dar trazabilidad y gestionar hallazgos arqueológicos.
Proyecto individual de 4 semanas (UMSA · Ingeniería de Sistemas). Idioma del proyecto, UI, commits y documentación: **español**. Identificadores de código del dominio también en español (`Pieza`, `Yacimiento`, `CapaEstratigrafica`), como en el modelo de datos.

## Qué es

Un solo backend y una sola base de datos con cuatro partes:

1. **API REST** (Django 5 + DRF, PostgreSQL 16, 11 tablas) en `/api/v1/`.
2. **App Android** (React Native + Expo, `.apk`) para investigadores en campo.
3. **Panel admin de Django** (`/admin/`) para usuarios, instituciones, catálogos, yacimientos completos y log de accesos.
4. **Ficha pública web** (vistas/plantillas Django) a la que se llega escaneando el QR de una pieza.

## Stack

- **Backend:** Python 3.12, Django 5 LTS, DRF, `djangorestframework-simplejwt`, `django-filter`, Pillow, `qrcode`, Gunicorn, WhiteNoise, `django-environ`, `django-cors-headers`.
- **App:** Expo, React Navigation (tabs: Yacimientos, Piezas, Perfil), Axios o TanStack Query, `expo-image-picker`, `expo-camera`, `expo-secure-store`, `Linking` para mapas.
- **Infra:** Docker Compose (base garantizada), Dokploy + Traefik + Cloudflare Tunnel (objetivo de cierre).
- **Calidad:** `pytest-django`, `factory_boy`, Ruff (backend), ESLint (app).

## Estructura sugerida

```
backend/    # Django: apps, settings, Dockerfile, tests
app/        # Expo / React Native
docker-compose.yml
.env.example
```

## Comandos

Ajustar si la estructura real difiere.

```bash
# Backend (desde la raíz)
docker compose up --build
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
docker compose exec backend pytest
docker compose exec backend ruff check .

# App
cd app && npx expo start        # desarrollo con Expo Go en celular real
cd app && npx eslint .
eas build -p android --profile preview   # .apk (alternativa: eas build --local)
```

## Modelo de datos (11 tablas)

`Institucion`, `Usuario` (rol: `administrador` | `investigador`, FK institución), `PeriodoCultural`, `TipoPieza`, `Etiqueta`, `Yacimiento`, `CapaEstratigrafica`, `Pieza`, `Fotografia`, `HistorialPieza`, `LogAcceso`.

Reglas del modelo:

- Procedencia: `Pieza → Capa → Yacimiento`. **No** duplicar `yacimiento` como columna de `Pieza`.
- Código de pieza: `ARQ-{AÑO}-{SECUENCIA}` (ej. `ARQ-2026-0042`), único y autogenerado.
- `Pieza.etiqueta` es FK opcional (una sola etiqueta, no M2M).
- `latitud`/`longitud` del yacimiento son `float` ingresados explícitamente. Sin PostGIS. Nunca leer coordenadas del EXIF.
- Índices en FKs consultadas: capa, periodo, tipo, etiqueta.
- Catálogos e instituciones: solo se crean/editan en el panel admin; la app los consume de solo lectura.

## Reglas de negocio que no se rompen

1. **Eliminación lógica.** Nada se borra físicamente: campo `activo` en yacimiento, capa y pieza. `DELETE` en la API pone `activo=False` y solo lo permite el Administrador. Las consultas de la app y de la ficha pública filtran `activo=True`.
2. **Historial solo de `Pieza`.** `HistorialPieza` (campo, valor anterior, valor nuevo, usuario, fecha) se llena **automáticamente con señales** `pre_save`/`post_save`, nunca a mano desde las vistas. Debe cubrir cambios de tipo, periodo, etiqueta, capa y `activo`. Yacimientos y capas NO tienen historial.
3. **`LogAcceso`** se llena solo con la señal `user_logged_in`. Solo logins exitosos; no registrar fallidos. Visible solo en el admin.
4. **Ficha pública** `/api/v1/public/piezas/{codigo}/`: 200 si `publica=True`; **403** con pantalla "Ficha restringida por la institución" si no es pública (sin revelar ningún dato de la pieza); 404 si el código no existe. Pieza inactiva se trata como no visible.
5. **Fotos:** validar tipo y tamaño, eliminar EXIF (incluido GPS), generar miniatura. Solo fotos de piezas (no de yacimientos).
6. **Permisos en el backend** (permisos DRF), no solo en la UI. Investigador: crea/edita/consulta yacimientos, capas y piezas, sube fotos, ve historial, genera QR; no elimina. Administrador: todo.
7. Listados paginados; `throttling` en login y ficha pública.

## API (`/api/v1/`, Bearer JWT salvo público)

`/auth/login/`, `/auth/refresh/`, `/auth/me/` · CRUD `/yacimientos/`, `/yacimientos/{id}/capas/`, `/piezas/` · `POST /piezas/{id}/fotos/` · `GET /piezas/{id}/qr/` (PNG) · `GET /piezas/{id}/historial/` (solo lectura) · `GET /catalogos/{periodos,tipos,etiquetas}/` · `GET /media/{foto_id}/` (control de visibilidad) · `GET /public/piezas/{codigo}/` · `GET /app/descargar.apk` · `GET /health/`.

## App móvil

- Foco de interfaz: **capas y piezas** (núcleo de campo). Yacimiento = formulario mínimo (nombre, lat, lon, periodo, estado).
- Selectores de catálogo poblados desde la API, solo lectura.
- JWT en `expo-secure-store`, nunca en AsyncStorage.
- QR se genera en el backend; la app solo lo muestra.
- "Ver en el mapa" abre la app de mapas con `Linking` (sin mapa embebido).
- Redimensionar imágenes antes de subirlas.

## Seguridad

- Secretos solo en variables de entorno; nunca commitear `.env`. Mantener `.env.example`.
- Producción: `DEBUG=False`, `ALLOWED_HOSTS` restringido, CORS restringido, HTTPS, contenedores sin root, puertos expuestos solo vía túnel.
- `/admin/` solo para rol Administrador.

## Fuera de alcance (no implementar ni proponer en esta versión)

Fotos de yacimientos · exposiciones temporales · etiquetas M2M · historial de yacimientos/capas · login fallidos · unidad de excavación · préstamos entre instituciones · Play Store/iOS · modo offline/push · 3D/IA · integraciones externas · API pública documentada · línea de tiempo · exportar PDF/CSV · rol "asistente" · PostGIS/mapa embebido · S3/SeaweedFS (las fotos van a volumen en disco).

Si una petición cae en esta lista, avisar y proponer dejarla como trabajo futuro.

## Plan por sprints (1 semana c/u)

1. Modelo de 11 tablas, migraciones, admin con catálogos y datos de ejemplo, Docker Compose, proyecto Expo.
2. Backend núcleo: JWT, roles, yacimientos, capas, piezas, señal de historial, señal de log; login en la app.
3. App núcleo: capas, piezas, fotos, QR, ficha pública, historial; primer intento Dokploy.
4. Búsqueda/filtros/mapa, despliegue final, pruebas, `.apk`, respaldo/restauración, informe y demo.

Plan de recorte si hay atraso (en orden): dejar Dokploy → reducir M8 a búsqueda por texto → simplificar ficha pública → limitar historial en la app a los últimos N cambios. El modelo de 11 tablas y las migraciones no se recortan.

## Convenciones de trabajo

- Metodología iterativa e incremental con sprints y Kanban (GitHub Projects). No llamarla "Scrum".
- **Criterio de terminado:** implementado, probado (automático en backend, manual en celular), corriendo en Docker Compose y sin errores de Ruff/ESLint.
- Pruebas obligatorias en backend: generación de código, permisos por rol (incluida restricción de eliminación), señal de historial, señal de log de acceso, validación de fotos, ficha pública (200/403/404), eliminación lógica, filtros, catálogos de solo lectura.
- Commits pequeños y en español, formato `tipo: descripción` (feat, fix, test, docs, chore).
- Cambios de modelo siempre con migración; no editar migraciones ya aplicadas.
- Antes de agregar una dependencia, verificar que no exista ya una solución en el stack.
- Respaldo diario: `pg_dump` + copia del volumen de fotos.

## Al trabajar conmigo

- Priorizar el núcleo (capas y piezas) sobre lo periférico.
- Preferir lo simple: es un proyecto individual de 4 semanas.
- Si algo contradice este archivo o la propuesta (`Propuesta_ArqueoCatalog_v4.md`), preguntar antes de decidir.
