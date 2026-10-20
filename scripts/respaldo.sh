#!/bin/sh
# Respaldo diario: pg_dump + copia del volumen de fotos. Uso: scripts/respaldo.sh [carpeta_destino]
# Programar con cron, por ejemplo:  0 2 * * * cd /ruta/ArqueoCatalog && scripts/respaldo.sh /mnt/respaldos
# Para copiar a un disco distinto al del servidor, apuntar la carpeta destino a ese medio (o usar rclone después).
set -eu
cd "$(dirname "$0")/.."
. ./.env
DESTINO="${1:-./respaldos}"
SELLO="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DESTINO"

docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists \
  | gzip > "$DESTINO/db-$SELLO.sql.gz"
docker compose exec -T backend tar -C /app -czf - media > "$DESTINO/fotos-$SELLO.tar.gz"

# Conserva los últimos 14 días.
find "$DESTINO" -name 'db-*.sql.gz' -mtime +14 -delete
find "$DESTINO" -name 'fotos-*.tar.gz' -mtime +14 -delete
echo "Respaldo listo en $DESTINO ($SELLO)"
