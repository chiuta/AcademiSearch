# AcademiSearch

[English](README.md) · [Română](README.ro.md) · [Français](README.fr.md) · [Italiano](README.it.md) · **Español** · [Português](README.pt.md) · [Deutsch](README.de.md) · [Magyar](README.hu.md)

**Versión:** 4.2.0 · **Última actualización:** 2026-10-18

Un buscador académico unificado en un único archivo HTML: 42 fuentes de acceso abierto, 7 idiomas de interfaz.

**Aplicación en línea:** https://chiuta.github.io/AcademiSearch/

![Captura de pantalla](screenshot.png)

## Qué es

AcademiSearch es una aplicación contenida en un único archivo `index.html` que consulta simultáneamente varias fuentes académicas (artículos, preprints, libros, tesis, datos de investigación) y muestra los resultados en una ventana común. Para una parte de las fuentes los resultados se obtienen directamente mediante API; para el resto, la aplicación ofrece un enlace directo a la página de búsqueda del portal correspondiente. Según el texto de la aplicación, hay 42 fuentes: 11 con resultados en vivo mediante API y 31 portales con enlace directo.

## Funciones

- Interfaz en 7 idiomas: rumano, inglés, francés, alemán, español, portugués, italiano (botones RO / EN / FR / DE / ES / PT / IT).
- Ajustes preestablecidos de búsqueda: «Todas las fuentes», «Estudiante / Doctorando», «Investigador / Personal docente», «Libros y manuales», «Fuentes rumanas», «Lenguas románicas».
- Un panel «Fuentes activadas» con marcado individual de las fuentes.
- Filtros por categoría (Artículos, Preprint, Libros, Tesis, Datos) y por idioma (EN, RO, FR, DE, ES, PT, IT).
- Resultados con los filtros «Con PDF» y «Con DOI» y carga progresiva de los resultados.
- Un campo «DOI / URL» con los botones «Acceso libre» y «Unpaywall»: la aplicación busca una versión de acceso abierto mediante CrossRef (si falta el DOI), Unpaywall, OpenAIRE y una búsqueda por título en Unpaywall.
- Campos opcionales para una clave API de CORE y una clave API de Semantic Scholar.
- Exportación de los resultados filtrados a BibTeX, RIS o CSV (archivo generado localmente en el navegador, sin solicitudes de red). La lista de autores se exporta tal como la devuelve la fuente (algunas fuentes truncan la lista), y los campos CSV que empiezan por `=`, `+`, `-` o `@` se neutralizan.
- El campo «DOI / URL» limpia los prefijos (`doi:`, `https://doi.org/`) y muestra un mensaje claro cuando el formato del DOI no es válido.
- La tecla `/` lleva el foco al campo de búsqueda; se sugieren las búsquedas de la sesión actual (no se guarda nada).
- Una ventana «Términos legales y RGPD».

## Funciones nuevas (4.1.0)

- **Ordenación por relevancia** de los resultados filtrados en la ventana de resultados: búsqueda local (BM25, tolerancia a errores de escritura, signos diacríticos ignorados) sobre los títulos y resúmenes ya obtenidos; la antigua coincidencia literal se mantiene. No hace ninguna solicitud de red.
- **«Mi biblioteca»**: botones de guardar/quitar en cada tarjeta; una ventana con búsqueda en la biblioteca, exportación BibTeX / RIS / CSV y borrado en dos pasos. Un máximo de 500 registros, guardados solo en este navegador.
- Copia de seguridad `.fff.json` (módulo común «fff-kit», local, sin red): se abre desde el cuadro de diálogo que aparece al hacer clic en la versión del pie de página (exportación, exportación cifrada con contraseña, importación con confirmación, borrado de los datos de la aplicación). La copia incluye la biblioteca y el idioma de la interfaz.
- Los nuevos textos de la biblioteca están en rumano, inglés, francés, alemán, español, portugués e italiano; **las traducciones no han sido verificadas por hablantes nativos.**

## Manual de uso

1. Abre la página y elige el idioma de la interfaz en la esquina superior (RO, EN, FR, DE, ES, PT, IT).
2. Elige un ajuste preestablecido (por ejemplo «Estudiante / Doctorando») o abre «Fuentes activadas» y marca manualmente las fuentes deseadas.
3. Opcionalmente, restringe por CATEGORÍA e IDIOMA.
4. Escribe el término en el campo de búsqueda y pulsa Intro o el botón «BUSCAR».
5. En la ventana de resultados usa los filtros «Con PDF» / «Con DOI»; cierra con «Cerrar» o la tecla Escape.
6. Para un artículo conocido, pega el DOI o la URL en el campo «DOI / URL» y pulsa «Acceso libre» (o «Unpaywall»).
7. Para CORE y Semantic Scholar puedes introducir la clave API y pulsar «Guardar» (las claves son opcionales).

## Privacidad y red

- Local: el idioma de la interfaz se guarda en `localStorage` (`ui_lang`); la biblioteca personal, en `localStorage` (`as_library`, un máximo de 500 registros, no sale del navegador); las claves API introducidas se guardan en `sessionStorage` y desaparecen al cerrar la pestaña. La aplicación no usa cookies.
- Red: la aplicación NO funciona sin conexión. En cada búsqueda, el término buscado se envía a los servicios externos activos, directamente desde el navegador: OpenAlex, CrossRef, CORE, Semantic Scholar, arXiv, Europe PMC (ebi.ac.uk), DOAJ, Zenodo, Open Library, Internet Archive, Project Gutenberg (gutendex.com). Con «Acceso libre» / «Unpaywall» se contacta con CrossRef, Unpaywall y OpenAIRE.
- Proxy CORS (opt-in, desactivado por defecto): arXiv y Semantic Scholar se consultan directamente. Solo si marcas explícitamente «Permitir el proxy público allorigins.win» (junto a los campos de claves API; válido durante la pestaña) y el navegador bloquea la solicitud directa (CORS), esa solicitud se reenvía a través de `api.allorigins.win`, que puede ver la URL de la consulta (el término buscado). Las claves API nunca pasan por el proxy.
- Las solicitudes a OpenAlex y Unpaywall incluyen la dirección de contacto del operador (`academisearch@alexio.tf`), conforme a la convención del «polite pool».
- Los portales con enlace directo solo se contactan si abres el enlace.
- Fuentes tipográficas/CDN: verificado en la auditoría (2026-10-10): no hay scripts, fuentes ni estilos cargados desde un CDN; las fuentes están integradas, y la política CSP de la página (`connect-src`; `script-src` con hash, sin `unsafe-inline`) limita las solicitudes a los hosts indicados arriba.

## Ejecución local / sin conexión

Descarga `index.html` y ábrelo en un navegador. La interfaz arranca en local, pero la búsqueda requiere conexión a internet.

## Historial / Registro de cambios

### 18 de octubre de 2026 (v4.2.0)
- Novedad: enlace de entrada `#q=<término>` (p. ej. desde Nota Zero) que solo rellena previamente el campo de búsqueda; la búsqueda no se inicia sola, y el fragmento se borra de la dirección tras leerlo.

### 18 de octubre de 2026 (v4.1.1)
- Fuentes que ya no se quedan en rojo/bloqueadas: arXiv (sin CORS) pasa automáticamente a los preprints de arXiv en OpenAlex; CORE sin clave pasa a OpenAIRE y luego a los repositorios OA de OpenAlex; Semantic Scholar reintenta tras un 429 y luego pasa a OpenAlex; Gutenberg tiene un tiempo de espera de 8 s y una alternativa en la colección Gutenberg de Archive.org.
- Cada fuente tiene un tiempo de espera de 30 s, y el motivo del error aparece como información emergente en el chip rojo.

### 14 de octubre de 2026 (v4.1.0)
- Ordenación local por relevancia en la ventana de resultados (FFF.search).
- «Mi biblioteca» (clave de `localStorage` `as_library`) con búsqueda y exportación BibTeX/RIS/CSV.
- Copia de seguridad `.fff.json` mediante los módulos comunes (core, label, bundle, search); versión mostrada en el pie de página.
- Pruebas nuevas: `tests/fff-r8.test.mjs`.

### 12 de octubre de 2026 (v4.0.4)
- 4.0.4 — 2026-10-12: la versión y la fecha de la última actualización se muestran en la aplicación

### 11 de octubre de 2026 (v4.0.3)
- Corregido el botón BUSCAR cortado en pantallas de 360 px y ampliadas las áreas táctiles pequeñas (botones, filtros, casillas).
- La tecla «/» lleva el foco al campo de búsqueda; las búsquedas de la sesión actual aparecen como sugerencias (solo en memoria, no se guardan).

### 11 de octubre de 2026 (v4.0.3)
- Seguridad: los 34 atributos `on*` en línea se sustituyeron por un despachador delegado (`data-act` + un único listener); la política CSP usa ahora `script-src` con hash, sin `'unsafe-inline'` para scripts.
- Exportación BibTeX / RIS / CSV de los resultados filtrados; mensajes en los 7 idiomas.
- Validación y limpieza del campo DOI, con un mensaje de error accesible (`role="status"`).

### 11 de octubre de 2026 (v4.0.1)
- Accesibilidad: el contenido está envuelto en <main>, las fuentes son ahora elementos con un rol `checkbox` válido (axe: 0 infracciones).
- Advertencia de derechos de autor añadida a las fuentes 101books.club y Scribd Downloader (descripción/información emergente), aclarando que no son fuentes de acceso abierto.
- La versión en la ventana «Términos legales» y la fecha de actualización: 4.0.1, 11 de octubre de 2026.

## Licencia

MIT — consulta el archivo LICENSE

## Autor

Alexio — Alexandru-Ionuț Chiuță, contacto: alexio@trom.tf

## Resumen

AcademiSearch es una herramienta HTML de metabúsqueda en un único archivo sobre 42 fuentes académicas de acceso abierto (11 con resultados en vivo mediante API, 31 como portales con enlace directo), con interfaz en 7 idiomas. No funciona sin conexión: las búsquedas van directamente del navegador a API de terceros, y arXiv/Semantic Scholar solo pueden usar el proxy CORS allorigins.win si marcas explícitamente una casilla opt-in (desactivada por defecto). Solo se guardan el idioma de la interfaz (localStorage) y las claves API opcionales (sessionStorage). Licencia MIT. Los resultados filtrados se pueden exportar como BibTeX, RIS o CSV (generados localmente).

Auditoría de la ronda 2 (2026-10-11): el proxy allorigins.win pasó a ser opt-in. Auditoría: 2026-10-10 — verificado el código (solicitudes de red, escape de los resultados de la API, proxy CORS: las claves API se envían solo en la cabecera directa, nunca a través del proxy), la accesibilidad (axe) y el funcionamiento (búsqueda sin conexión: errores de fuente gestionados). La cifra «42 fuentes» coincide: 11 API + 31 portales.
