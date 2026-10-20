# Guion de demo (flujo completo, ~8 min)

Preparación: backend en Docker Compose local (red local), app instalada, datos de ejemplo cargados, video de respaldo.

1. Login como **investigador** en el celular.
2. Crear un yacimiento (o abrir uno) → `Ver en el mapa`.
3. Crear una capa → crear una pieza **pública** → mostrar el código autogenerado.
4. Tomar una foto → verla en el detalle.
5. Editar la pieza (cambiar tipo/etiqueta) → abrir **Historial**: aparecen los cambios, con usuario y fecha.
6. Abrir el **QR** → escanearlo con otro celular → **ficha pública** (200).
7. Editar la pieza a no pública → volver a escanear → **"Ficha restringida"** (403). Probar un código inexistente (404).
8. Buscar y filtrar piezas en la pestaña Piezas.
9. Entrar al **admin** como administrador: log de accesos, catálogos, desactivar la pieza (eliminación lógica).
10. Mostrar respaldo y restauración (`scripts/`).
