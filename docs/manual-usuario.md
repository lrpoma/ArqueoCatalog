# Manual de usuario — ArqueoCatalog

## Investigador (app móvil)
1. **Iniciar sesión** con el usuario y la contraseña entregados por el administrador.
2. **Yacimientos:** buscar por nombre, crear con el botón `+ Yacimiento` (nombre, latitud, longitud, periodo y estado)
   y abrir uno para ver sus datos. `Ver en el mapa` abre la app de mapas del celular.
3. **Capas:** dentro de un yacimiento, `+ Capa` (código y profundidades en metros).
4. **Piezas:** dentro de una capa, `+ Pieza` (nombre, tipo, periodo, etiqueta opcional y si su ficha es pública).
   El código `ARQ-AÑO-NNNN` se asigna solo.
5. **Fotos:** en el detalle de la pieza, `Tomar foto` o `Elegir de la galería`. Se eliminan los metadatos (incluido GPS).
6. **QR:** `Ver código QR` muestra el código que lleva a la ficha pública.
7. **Historial:** `Ver historial de cambios` lista quién cambió tipo, periodo, etiqueta, capa o estado, y cuándo.
8. **Buscar y filtrar piezas:** pestaña Piezas, por código, nombre o material; `Filtros` por periodo, tipo y etiqueta.

Los investigadores no pueden desactivar registros; solo el administrador.

## Administrador (`/admin/`)
Usuarios y roles, instituciones, catálogos (periodos, tipos, etiquetas), yacimientos y el registro de accesos.
Puede desactivar yacimientos, capas y piezas (eliminación lógica: nada se borra).

## Ficha pública
Al escanear el QR se abre `/api/v1/public/piezas/<código>/`: muestra la pieza si es pública; si no, la pantalla
"Ficha restringida por la institución" sin ningún dato.
