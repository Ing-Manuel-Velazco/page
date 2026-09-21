# Registro de cambios — Portafolio web

Este documento resume los cambios realizados durante la mejora del portafolio y sirve como guía para continuar el trabajo.

## Verificación de titulación

La sección conserva una **captura de referencia** dentro del sitio. La validación auténtica se realiza exclusivamente en el portal de la Universidad de Colima.

- El modal deja claro que la imagen es una vista previa, no una consulta en tiempo real.
- El enlace a `titulacion.ucol.mx` abre en una pestaña nueva, por lo que el visitante no abandona el portafolio.
- Se actualizaron los textos en español, inglés y portugués.

Archivos relacionados:

- `index.html`
- `js/verificacion.js`
- `js/i18n.js`

## Carta 3D de experiencia

El mapa inicial se construía a partir de `mexico-data.js`. Ese conjunto incluía islas y fragmentos pequeños, que al extruirse en 3D producían barras o líneas aisladas.

Se aplicaron estas mejoras:

- Se selecciona la masa territorial principal de cada estado para la carta editorial.
- La cámara inicial tiene una vista más cenital.
- Se redujo el relieve de los estados sin experiencia y se conserva el realce de los estados relacionados con el CV.
- El pie del mapa cambió de un contador técnico de geometrías a información útil: estados destacados y experiencias.

Archivos relacionados:

- `js/geo3d.js`
- `js/mapa.js`
- `js/i18n.js`

## Marco Geoestadístico Integrado 2025 de INEGI

Se añadió la carpeta `Mexico/`, con el Marco Geoestadístico Integrado 2025. Los shapefiles originales no se modifican.

Capas relevantes:

| Archivo | Contenido | Registros |
| --- | --- | ---: |
| `Mexico/conjunto_de_datos/00ent.shp` | Áreas geoestadísticas estatales | 32 |
| `Mexico/conjunto_de_datos/00mun.shp` | Áreas geoestadísticas municipales | 2,478 |
| `Mexico/conjunto_de_datos/00l.shp` | Localidades | No se usa en la vista inicial |
| `Mexico/conjunto_de_datos/00a.shp` | AGEB | No se usa en la vista inicial |

Los metadatos de INEGI indican que estas capas son áreas geoestadísticas orientadas a referencia y organización territorial; no deben presentarse como límites político-administrativos de precisión oficial.

## Datos optimizados para web

Los shapefiles se transformaron a GeoJSON en coordenadas WGS84 y se simplificaron para la web.

```text
geo/
  estados.geojson
  municipios/
    municipio1.geojson
    municipio2.geojson
    ...
    municipio32.geojson
```

- `geo/estados.geojson` contiene los 32 estados.
- Cada archivo municipal contiene únicamente los municipios de una entidad.
- El nombre de los archivos municipales usa el número de entidad sin cero inicial: `municipio6.geojson` para Colima y `municipio14.geojson` para Jalisco.
- Se preservan los atributos `CVE_ENT`, `CVE_MUN`, `CVEGEO` y `NOMGEO`.
- La carta muestra la masa territorial principal de cada entidad y municipio. Los polígonos insulares alejados, como Revillagigedo, se omiten para conservar un encuadre legible.

La conversión se hizo con Mapshaper, importando en Latin-1 por la codificación DBF del conjunto de INEGI:

```powershell
npx --yes mapshaper -i "Mexico/conjunto_de_datos/00ent.shp" encoding=latin1 -proj wgs84 -filter-fields CVE_ENT,CVEGEO,NOMGEO -simplify weighted 5% keep-shapes -o format=geojson precision=0.0001 "page-main/geo/estados.geojson"

npx --yes mapshaper -i "Mexico/conjunto_de_datos/00mun.shp" encoding=latin1 -proj wgs84 -filter-fields CVE_ENT,CVE_MUN,CVEGEO,NOMGEO -simplify weighted 2% keep-shapes -split CVE_ENT -o format=geojson precision=0.0001 "page-main/geo/municipios/municipio.geojson"
```

## Arquitectura prevista del mapa

```text
Vista nacional
  └─ Carga geo/estados.geojson.

Clic o acercamiento a un estado
  └─ Carga bajo demanda geo/municipios/municipio{entidad}.geojson.

Clic en un municipio
  └─ Abre una ficha lateral dentro de la carta con nombre, clave geoestadística y experiencia asociada cuando exista.

Restablecer
  └─ Oculta/libera la capa municipal y vuelve a la vista nacional.
```

El objetivo es evitar descargar los 2,478 municipios al cargar la página. Las capas de localidades y AGEB se reservan para una futura visualización técnica, no para la portada del portafolio.

## Estado de implementación

`js/geo3d.js` ya incluye utilidades para:

- Convertir GeoJSON en datos utilizables por la carta 3D.
- Cargar la capa estatal desde `geo/estados.geojson`.
- Conservar claves de entidad, municipio y área geoestadística en cada malla.

`js/mapa.js` carga municipios de forma diferida por entidad. Seleccionar un estado no abre una ventana: mantiene el mapa visible y habilita **Ver trabajos**. Ese botón, y los municipios individuales, muestran una ficha lateral cerrable dentro de la carta.

La capa municipal se pinta en color ámbar, con contorno de alto contraste independiente del azul del estado y se eleva ligeramente sobre la extrusión estatal. Los colores se recalculan al alternar entre tema oscuro y claro para que las divisiones municipales sigan siendo legibles.

Las fichas municipales sin experiencia muestran únicamente su encabezado y la fuente `Consulta territorial · DATOS DE INEGI 2025`. El acercamiento mínimo de la carta es `10`, disponible con el botón `+` o la rueda del mouse. El registro de SEDENA está ubicado en Zapopan, Jalisco, con coordenadas `[20.721, -103.391]`.

El botón **Ver en mapa** carga los municipios del estado, busca el municipio del registro y vuela hacia él. El municipio encontrado queda resaltado con fucsia translúcido y borde reforzado, con colores equivalentes para ambos temas. Los estados mantienen una altura uniforme; la capa municipal se eleva apenas sobre ellos.

La carta 3D inicia en formato panorámico. Al seleccionar un estado con registros, **Ver trabajos** despliega un panel de trayectoria amplio a la derecha: el buscador permanece arriba, seguido del total acumulado en años y meses y de los filtros fijos **Todos · País · Estado**. El mapa se redimensiona para conservar visible la entidad seleccionada y las tarjetas tienen mayor ancho para leer puesto y empresa cómodamente. El botón cambia a **Ocultar trabajos** para volver a la carta amplia. En móvil, el panel se apila debajo del mapa.

Al seleccionar un estado se abre inmediatamente una ficha estatal translúcida sobre el lado izquierdo del visor, mientras se carga su capa municipal. Muestra la clave AGEE y la clave de entidad, la referencia al Marco Geoestadístico 2025, el enlace al Catálogo Único de INEGI y una reseña breve con fuente editorial. Al elegir después un municipio, la ficha estatal se reemplaza por la ficha municipal: nombre, entidad, clave AGEM concatenada y las claves separadas de entidad y municipio. Esos identificadores se leen de los atributos `CVE_ENT`, `CVE_MUN` y `CVEGEO` que preservan los GeoJSON web, procedentes del Marco Geoestadístico 2025; no se descargan los SHP, DBF ni catálogos de la carpeta `Estados de México/` en el navegador. Las reseñas se solicitan en la Wikipedia del idioma activo (`es`, `en` o `pt`) y la ficha se vuelve a dibujar al cambiar de idioma. Se conserva una caché en memoria por territorio e idioma, con precarga al pasar por un estado, para evitar consultas repetidas y mejorar la respuesta. Las fichas distinguen la fuente territorial de INEGI de la reseña editorial; si ésta no existe en el idioma solicitado, presentan únicamente la identificación territorial. El cierre no modifica la capa municipal activa.

El pie de la carta 3D presenta el distintivo INEGI 2025, los estados destacados, las experiencias y los años de experiencia como indicadores centrados. El perfil usa únicamente `foto.png` como retrato: se presenta sin textos superpuestos y con un borde luminoso que rota entre los colores de la interfaz. La imagen no permite selección, arrastre, copiado ni menú contextual desde la interfaz. A su derecha se agrupan **Quién soy**, la frase de presentación, la biografía con credenciales destacadas y las tres áreas **Medir**, **Analizar** y **Decidir**.

La portada se limita a la identidad principal: nombre, carrera, disponibilidad y los botones **Ver trayectoria** y **Establecer contacto**. No muestra el rótulo de portafolio, ubicación ni cédula profesional.

## Próximos pasos

1. Validar el mapa en `localhost:8000` y confirmar que la capa estatal de INEGI sustituye la geometría de respaldo.
2. Ajustar el comportamiento de activación: abrir municipios por clic, por umbral de zoom, o por ambas acciones.
4. Añadir marcadores de experiencia para Guadalajara, Colima y Cuauhtémoc.
5. Revisar rendimiento en móvil y calibrar la simplificación de geometrías si fuera necesario.
