#!/bin/sh
# Restaura un respaldo. Uso: scripts/restaurar.sh db-AAAAMMDD-HHMMSS.sql.gz [fotos-AAAAMMDD-HHMMSS.tar.gz]
# ATENCIÓN: reemplaza el contenido actual de la base (el volcado incluye --clean).
set -eu
cd "$(dirname "$0")/.."
. ./.env
[ $# -ge 1 ] || { echo "Uso: $0 db.sql.gz [fotos.tar.gz]"; exit 1; }

gunzip -c "$1" | docker compose exec -T db psql -v ON_ERROR_STOP=1 -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null
if [ $# -ge 2 ]; then
  docker compose exec -T backend tar -C /app -xzf - < "$2"
fi
echo "Restauración completa."
