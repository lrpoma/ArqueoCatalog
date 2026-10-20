# Despliegue en Dokploy (primer intento, Sprint 3)

Reutiliza Docker Compose con `docker-compose.dokploy.yml` (sin puertos publicados; Traefik enruta el dominio).
Docker Compose local (`docker-compose.yml`) sigue siendo el entorno de demostración garantizado.

## Pasos

1. En Dokploy: **Create Service → Compose**, origen Git (este repositorio, rama `main` o `semana-3`) y
   *Compose Path* = `./docker-compose.dokploy.yml`.
2. Pestaña **Environment**, con valores reales (nunca commitear):
   ```
   DEBUG=False
   SECRET_KEY=<clave larga y aleatoria>
   ALLOWED_HOSTS=<dominio>
   CSRF_TRUSTED_ORIGINS=https://<dominio>
   CORS_ALLOWED_ORIGINS=https://<dominio>
   URL_PUBLICA=https://<dominio>
   POSTGRES_DB=arqueocatalog
   POSTGRES_USER=arqueocatalog
   POSTGRES_PASSWORD=<contraseña>
   ```
3. Pestaña **Domains**: servicio `backend`, puerto `8000`, HTTPS con Let's Encrypt (o, tras el túnel,
   HTTPS lo termina Cloudflare y el origen va en HTTP: `X-Forwarded-Proto` ya está soportado).
4. **Deploy**. El `entrypoint.sh` ejecuta migraciones y `collectstatic` al arrancar.
5. Crear el administrador: terminal del servicio →
   `python manage.py createsuperuser` (y `cargar_datos_ejemplo` si se quieren catálogos de ejemplo).
6. Verificar: `https://<dominio>/api/v1/health/`, `/admin/` y la ficha pública de una pieza.
7. Cloudflare Tunnel: apuntar el hostname público al servicio de Traefik de Dokploy (Sprint 4).
8. En la app, `EXPO_PUBLIC_API_URL=https://<dominio>/api/v1`.

## Pendiente para el Sprint 4

- Ejecutarlo en el servidor real y registrar los problemas encontrados.
- Respaldo diario: `pg_dump` + copia del volumen `media`.
- Probar restauración.
