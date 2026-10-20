# Respaldo y restauración

```bash
scripts/respaldo.sh /mnt/respaldos          # pg_dump + volumen de fotos; conserva 14 días
scripts/restaurar.sh db-<sello>.sql.gz fotos-<sello>.tar.gz
```

Diario con cron: `0 2 * * * cd /ruta/ArqueoCatalog && scripts/respaldo.sh /mnt/respaldos`
(el destino debe ser un medio distinto al disco del servidor).

**Prueba de restauración (hecha el 2026-10-19):** respaldo → se creó una tabla de prueba y se modificó un usuario →
`restaurar.sh` → el cambio en el usuario se revirtió y los datos coincidieron con el respaldo. Nota: `--clean` solo
elimina objetos que existen en el respaldo; tablas ajenas a él (como la de prueba) no se tocan.
