#!/bin/sh
# Restaura un respaldo hecho con respaldo.sh. DESTRUYE los datos actuales de la base y de las fotos.
# Uso:  ./scripts/restaurar.sh respaldos/db-AAAAMMDD-HHMMSS.dump respaldos/media-AAAAMMDD-HHMMSS.tar.gz
set -eu
[ $# -eq 2 ] || { echo "Uso: $0 <db.dump> <media.tar.gz>"; exit 1; }
DUMP="$1"; MEDIA="$2"
printf "Esto reemplaza la base y las fotos actuales. Escriba SI para continuar: "
read -r R; [ "$R" = "SI" ] || { echo "Cancelado."; exit 1; }

docker compose exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < "$DUMP"
docker compose exec -T backend sh -c 'rm -rf /app/media/* && tar -C /app -xzf -' < "$MEDIA"
echo "Restauración completa. Verifique: curl http://localhost:8000/api/v1/health/"
