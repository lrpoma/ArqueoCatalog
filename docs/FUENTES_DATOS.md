# Fuentes para llenar ArqueoCatalog con datos reales

20 fuentes para poblar catálogos, yacimientos, capas, piezas y fotos de la demo.
Revisadas el 17-nov-2026. La columna **Estado** dice qué pude comprobar de verdad:

- ✅ **Abrí la página** y vi su contenido.
- 🔎 **No pude abrirla desde mi herramienta** (bloquea bots o dio error temporal) pero aparece en resultados de búsqueda. Ábrela tú en el navegador.

## Antes de usar los datos (léelo)

1. **Es una demo.** Registra las piezas como *ejemplos inspirados* en colecciones reales, no como inventario oficial de un museo. En «descripción» pon la fuente (p. ej. «Basado en Met 1978.412.214, dominio público»).
2. **Licencias.** CC0 y dominio público: se pueden copiar y subir como fotos de la demo. CC BY / CC BY-SA: se puede, **citando autoría y licencia**. Fotos de Wikimedia Commons: cada archivo tiene su propia licencia; revísala en su página.
3. **Coordenadas.** Usa solo sitios turísticos y públicos (Tiwanaku, Isla del Sol…). No publiques coordenadas precisas de sitios no protegidos: es un riesgo de saqueo. Recuerda que en ArqueoCatalog las coordenadas se escriben a mano, **nunca del EXIF**.
4. **Fotos.** La app ya elimina EXIF y reduce a 2048 px; descarga imágenes medianas (≈1000–2000 px) y sube 1–2 por pieza.
5. **Profundidades de capas.** Ninguna fuente pública da «C-02 de 0,4 a 1,1 m» de un sitio concreto; son valores ilustrativos que defines tú (como ya hace `cargar_datos_ejemplo`). Si quieres respaldo, cita estratigrafías publicadas en los artículos de las fuentes 11, 12 y 14.

## Qué dato va en qué campo

| Campo en ArqueoCatalog | Mejores fuentes |
|---|---|
| **PeriodoCultural** (nombre, año inicio/fin) | 2, 4, 8 |
| **Yacimiento** (nombre, lat/lon, estado, descripción) | 1, 2, 3, 4, 5, 8 |
| **CapaEstratigrafica** | 11, 12, 14 (ilustrativo) |
| **Pieza** (nombre, tipo, material, descripción) | 6, 7, 16, 17, 18, 19 |
| **Fotografía** | 6, 16, 17, 18, 19 (revisar licencia) |
| **Institucion** | 7, 9, 12, 15 |
| **TipoPieza / Etiqueta** | 16–19 (vocabulario de «Classification/Medium») |

---

## A. Sitios, periodos y contexto (Tiwanaku, Isla del Sol…)

| # | Fuente | Qué sacar de ahí | Licencia / acceso | Estado |
|---|---|---|---|---|
| 1 | **UNESCO – Tiwanaku: centro espiritual y político** <https://whc.unesco.org/en/list/567> | Descripción oficial, criterios (iii) y (iv), año de inscripción (2000), mapa del sitio y coordenadas | Textos de UNESCO; citar la fuente | 🔎 (403 a mi herramienta; el ID 567 lo confirman Wikipedia y Commons) |
| 2 | **Plan de Manejo 2015-2020 de Tiwanaku (UNESCO)** <https://whc.unesco.org/en/documents/134969> | Sectores del sitio (Akapana, Kalasasaya, Pumapunku…), cronología cultural, estado de conservación → «estado» del yacimiento | Documento público de UNESCO | 🔎 (salió en búsquedas; PDF) |
| 3 | **CIAAAT – Centro de Investigaciones Arqueológicas, Antropológicas y Administración de Tiwanaku** <https://tiwanaku.gob.bo> | Plan de manejo, informes de gestión (p. ej. `…/uploads/2022/04/Informe-de-Gestion-2021.pdf`), nombres de las áreas de excavación | Documentos de entidad pública boliviana | 🔎 (los PDF aparecen en búsquedas) |
| 4 | **Wikipedia ES – Tiahuanaco** <https://es.wikipedia.org/wiki/Tiahuanaco> | Cronología (periodos aldeano, urbano, expansivo), estructuras del sitio, coordenadas | CC BY-SA 4.0 | ✅ |
| 5 | **Wikidata – Tiwanaku (Q61750)** <https://www.wikidata.org/wiki/Q61750> | Coordenadas exactas, enlaces a todos los demás elementos (Akapana, Pumapunku, Kalasasaya…) para sacar lat/lon de cada estructura | Datos CC0 | ✅ (el identificador lo verifiqué en Commons y Wikipedia; la página de Wikidata en sí no la abrí) |
| 6 | **Wikimedia Commons – Category:Tiwanaku** <https://commons.wikimedia.org/wiki/Category:Tiwanaku> | ~280 fotos: Puerta del Sol, Kalasasaya, Puma Punku, Akapana y piezas del Museo del Sitio | Licencia **por archivo** (CC BY-SA, CC BY, dominio público…) | ✅ |

> Para **Isla del Sol – Chincana** no existe una categoría `Category:Isla_del_Sol` en Commons (da 404); busca «Chinkana» o «Isla del Sol» con el buscador de Commons.

## B. Instituciones y colecciones bolivianas

| # | Fuente | Qué sacar de ahí | Licencia / acceso | Estado |
|---|---|---|---|---|
| 7 | **Wikipedia ES – Museo Nacional de Arqueología (MUNARQ)** <https://es.wikipedia.org/wiki/Museo_Nacional_de_Arqueolog%C3%ADa_(Bolivia)> | Datos de la institución (Palacio Tiwanaku, La Paz, monumento nacional) para la tabla `Institucion` y tipos de colección (lítico, cerámica, textil, metal). Ojo: la página da dos cifras distintas de piezas; no las uses como dato | CC BY-SA 4.0 | ✅ |
| 8 | **Bolivian Radiocarbon Database** (Capriles, 2023) — artículo <https://doi.org/10.5334/joad.104> · datos en tDAR <https://core.tdar.org/collection/71234/bolivian-radiocarbon-database> | **3.269 fechas de 745 sitios** con ubicación y cronología: ideal para fijar `anio_inicio/anio_fin` de periodos y elegir sitios reales con su fechado | Artículo CC BY 3.0; dataset CC BY 4.0 (citar). Hoja Excel descargable | ✅ el artículo · 🔎 tDAR (403 a mi herramienta) |
| 9 | **Repositorio institucional UMSA** <https://repositorio.umsa.bo> | Tesis y trabajos dirigidos de la Carrera de Arqueología UMSA: descripciones de materiales, capas y sitios reales; nombre oficial de la institución | Acceso abierto (revisa cada documento) | ✅ (~44.000 ítems) |
| 10 | **SIARB – Sociedad de Investigación del Arte Rupestre de Bolivia** <https://siarb-bolivia.org> | Boletines con sitios y descripciones de arte rupestre; sitios para yacimientos de ejemplo | Publicaciones de la sociedad; citar | 🔎 (su dominio apareció en un PDF de búsqueda; no abrí la portada) |

## C. Artículos y bibliografía (para descripciones, periodos y capas)

| # | Fuente | Qué sacar de ahí | Licencia / acceso | Estado |
|---|---|---|---|---|
| 11 | **Revista *Patrimonio y Arqueología*** (OPCA-UMSA) <https://ojs.umsa.bo/ojs/index.php/patrimonio_arqueologia> | Artículos sobre catastros y patrimonio arqueológico boliviano; ejemplos de fichas y estratigrafía | Acceso abierto; citar | ✅ |
| 12 | **SciELO Bolivia** <https://www.scielo.org.bo> | Revistas científicas bolivianas a texto completo (busca «arqueología», «Tiwanaku», «cerámica») | Acceso abierto, licencia por revista | ✅ |
| 13 | **Revista *Chungará*** (Univ. de Tarapacá) <https://www.chungara.cl> | Arqueología andina: cronologías, tipologías cerámicas y líticas del altiplano | Creative Commons (la tipo varía por artículo) | ✅ |
| 14 | **Open Context** <https://opencontext.org> | Datos de excavación publicados como tablas descargables: ejemplos reales de cómo se registran capas, piezas y materiales (inspiración para los campos) | CC (varía por proyecto) | ✅ |
| 15 | **Museo Chileno de Arte Precolombino** <https://museo.precolombino.cl> (colecciones: <https://colecciones.precolombino.cl>) | Fichas de piezas andinas (textil, cerámica, metal) con vocabulario de tipos y materiales | Ver «Términos y condiciones» del sitio | ✅ portada · 🔎 el catálogo de colecciones no lo abrí |

## D. Colecciones abiertas con piezas Tiwanaku/Inca (nombres, materiales y fotos)

| # | Fuente | Qué sacar de ahí | Licencia / acceso | Estado |
|---|---|---|---|---|
| 16 | **The Met – Collection API** <https://metmuseum.github.io/> | Keros, incensarios, textiles y metales Tiwanaku/Inca: título, material, fecha, foto. Ej.: kero Tiwanaku 1978.412.214 (madera) | **CC0**; API REST JSON sin clave, dataset en GitHub `metmuseum/openaccess`. La doc avisa que `/v1/search` se retiraba el 1-oct-2026: confirma el endpoint vigente | ✅ |
| 17 | **Cleveland Museum of Art – Open Access API** <https://openaccess-api.clevelandart.org/> | Ej.: kero estilo Tiwanaku `1963.476` (cerámica engobada, 400-1000), marcado CC0 | Datos CC0; las **imágenes** solo si `share_license_status = CC0`. API REST y volcado JSON/CSV | ✅ |
| 18 | **Art Institute of Chicago – API** <https://api.artic.edu/docs/> | Ej.: vasija globular del área boliviana, 600-1000 d. C. (<https://www.artic.edu/artworks/4835/>), con designación CC0 | CC0 en las obras marcadas de dominio público; API gratuita | 🔎 (la doc dio 403 a mi herramienta; las fichas de obra salieron en búsqueda) |
| 19 | **Harvard Art Museums – API** <https://github.com/harvardartmuseums/api-docs> | Piezas precolombinas: título, medio, clasificación, imagen IIIF | **Requiere clave gratuita**, uso no comercial, atribución, sin guardar contenido >2 semanas sin permiso, 2.500 llamadas/día | ✅ (la documentación) |
| 20 | **Smithsonian Open Access** <https://www.si.edu/openaccess> | Millones de objetos e imágenes, incluidos del Museo Nacional del Indígena Americano (piezas andinas) | CC0 en lo marcado «Open Access» | 🔎 (403 a mi herramienta; es el portal oficial) |

---

## Otras fuentes que no pude confirmar (úsalas con cuidado)

- **MUSEF** (Museo Nacional de Etnografía y Folklore): un artículo de 2022 menciona `musef.org.bo/colecciones-3d`, pero el dominio no resuelve desde mi herramienta. Búscalo por su nombre.
- **GeoBolivia** (`geo.gob.bo`): portal oficial de mapas; dio fallo de DNS temporal y **no encontré** una capa de sitios arqueológicos. Pregunta en el Ministerio de Culturas, Descolonización y Despatrimonialización.
- **Museo Arqueológico de la UMSS** (Cochabamba): no encontré sitio oficial propio; usa Wikipedia o la página de la universidad.
- **Bibliografía clásica** (PDF en búsquedas): *30 mil años de prehistoria en Bolivia* (<https://www.andesacd.org/wp-content/uploads/2012/09/30-Mil-Años-de-Prehistoria-en-Bolivia.pdf>) y *Bibliografía de arqueología y arte rupestre boliviano* (<https://usfx.bo/Documentos/INIAA/Bibliografia_de_arqueologia_y_arte_rupestre_boliviano.pdf>).
- Contacta directamente a tu carrera (**Arqueología UMSA / IIAA**) o al **MUNARQ**: si quieres datos de verdad con permiso, es la vía correcta.

---

## Receta rápida (≈ 2 horas)

1. **Periodos** (fuentes 2, 4, 8): Formativo, Tiwanaku, Señoríos Aymaras, Inca… con años de inicio/fin. Ya están cargados cuatro por `cargar_datos_ejemplo`; amplíalos en `/admin/`.
2. **Yacimientos** (1, 2, 5): 6–8 sitios con lat/lon de Wikidata (Akapana, Kalasasaya, Pumapunku, Lukurmata, Iwawe, Isla del Sol…).
3. **Capas**: 2–3 por yacimiento con profundidades ilustrativas (nota 5 arriba).
4. **Piezas** (16–19): 25–40 piezas. Para cada una: nombre de la ficha de origen, tipo y material tal como los clasifica el museo, periodo, una capa, y en la descripción la **fuente y licencia**. Marca algunas como `publica=False` para poder demostrar la ficha restringida (403).
5. **Fotos** (6, 16–20): descarga 1 por pieza desde la ficha y súbela desde la app, para probar de paso EXIF, miniatura y el flujo de campo.
6. **Instituciones y usuarios** (7, 9): museo, universidad, y 2–3 investigadores de ejemplo.
