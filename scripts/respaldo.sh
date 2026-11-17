#!/bin/sh
# Respaldo local con Docker Compose: pg_dump + copia del volumen de fotos.
# Uso (desde la raíz):  ./scripts/respaldo.sh [directorio_destino]
# Programar con cron (diario 03:00):  0 3 * * * cd /ruta/ArqueoCatalog && ./scripts/respaldo.sh /srv/respaldos
set -eu
DESTINO="${1:-./respaldos}"
SELLO="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DESTINO"

docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' \
  > "$DESTINO/db-$SELLO.dump"
docker compose exec -T backend tar -C /app -czf - media > "$DESTINO/media-$SELLO.tar.gz"

# Conserva solo los últimos 14 respaldos de cada tipo.
ls -1t "$DESTINO"/db-*.dump 2>/dev/null | tail -n +15 | xargs -r rm --
ls -1t "$DESTINO"/media-*.tar.gz 2>/dev/null | tail -n +15 | xargs -r rm --
echo "Respaldo listo en $DESTINO ($SELLO)"
