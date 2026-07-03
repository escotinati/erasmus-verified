# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

**Erasmus Verified** — directorio de grupos de WhatsApp/Telegram para estudiantes Erasmus en 36+ países y 528+ ciudades europeas. También muestra un mapa interactivo con partners (locales nocturnos, alojamientos, etc.) por ciudad.

La misma web sirve **dos marcas** desde un solo código: "Erasmus Verified" (la web completa) y "Erasmus Parties" (solo la parte de fiestas/nightlife, en `erasmusparties.org`). Qué marca se muestra se decide automáticamente según el dominio — ver [Experiencia dual](#experiencia-dual-verified--parties) más abajo.

> **Nomenclatura de marca**: no cambiar las etiquetas de los grupos de WhatsApp/Telegram — son nombres de datos, no de marca.

**Stack**: HTML + CSS + JS vanilla (sin ES Modules, todo con `<script>` clásicos y funciones/objetos globales), más:
- **Vite** como build tool — ya no se abre `index.html` directamente, se usa `npm run dev` para desarrollar y `npm run build` para generar la carpeta `dist/` que se despliega.
- **Supabase** como backend — base de datos (Postgres) + login de administrador. Sustituye poco a poco a los datos estáticos de `data.js` (ver sección de Backend).

**Herramientas de desarrollo**: Prettier instalado como devDependency (`npm install` para instalar). Configuración en `.prettierrc`: 4 espacios, comillas simples, semi. Un hook de Claude Code formatea automáticamente JS/CSS/HTML tras cada edición — no hace falta ejecutarlo manualmente.

**Comandos**:
- `npm run dev` — levanta el servidor de desarrollo de Vite (recarga en caliente)
- `npm run build` — genera la versión de producción en `dist/`
- `npm run preview` — sirve `dist/` en local para probar el build final
- `npm run format` — pasa Prettier a mano por todo el proyecto (normalmente no hace falta, ya hay un hook)

**Variables de entorno**: copiar `.env.example` a `.env.local` (este último **nunca se sube al repo**, está en `.gitignore`) y rellenar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los datos del proyecto de Supabase. Vite las inyecta como `window.__SUPABASE_URL__` / `window.__SUPABASE_KEY__` en el `<head>` de cada página (ver `vite.config.js`).

## Arquitectura

Todo el JS de páginas y módulos compartidos vive ahora en `src/js/` (antes era `js/`). El CSS vive en `src/css/`. Sigue sin haber ES Modules: todo son `<script>` clásicos con funciones y objetos globales, para mantener coherencia entre archivos.

### Páginas y sus scripts

| Página | Script | Propósito |
|--------|--------|-----------|
| `index.html` | `src/js/index.js` | Autocomplete de búsqueda, bento grid de países |
| `ciudades-todas.html` | inline | Listado completo de ciudades con filtro alfabético |
| `ciudades.html` | `src/js/ciudades.js` | Grid de ciudades de un país (hero con foto) |
| `ciudad.html` | `src/js/ciudad.js` | Detalle de ciudad, botones WhatsApp/Telegram, mapa embebido |
| `mapa.html` | `src/js/mapa.js` | Mapa a pantalla completa con lista de partners |
| `alojamiento.html` | inline | Página de alojamiento para estudiantes Erasmus |
| `servicios.html` | inline | Servicios verificados: SIM, banca, transporte |
| `viajes.html` | inline | Viajes en grupo para estudiantes Erasmus |
| `admin/index.html` | `src/js/admin.js` | Panel de administración (login + gestión de ciudades/partners) — ver sección propia |

### Módulos compartidos (cargados donde se necesitan)

- `src/js/data.js` — objeto global `COUNTRIES` con todos los países y ciudades. **En proceso de sustitución por Supabase**: hoy solo lo usan `ciudades.js` y el inline de `ciudades-todas.html` (el listado completo por país). El resto de páginas (home, ciudad, mapa, admin) ya piden los datos a Supabase.
- `src/js/lib/supabaseClient.js` — crea `window.supabaseClient`, el cliente de Supabase que usan todos los demás scripts para hablar con la base de datos.
- `src/js/services/citiesService.js` — funciones `fetchActiveCities()`, `fetchCityById(id)`, `fetchAllCities()` para leer ciudades desde Supabase.
- `src/js/services/partnersService.js` — función `fetchPartnersByCity(cityId)` (trae partners + sus links) y `groupPartnersByCategory(partners)`.
- `src/js/tracking.js` — función `trackEvent(nombre, datos)`; registra clics en links de partners (tabla `cta_clicks` en Supabase) y los imprime en consola para depurar.
- `src/js/experience.js` — decide si la página se muestra como "Verified" o "Parties" según el dominio. Se carga como primer script de cada página. Ver sección [Experiencia dual](#experiencia-dual-verified--parties).
- `src/js/geocoder.js` — cliente Nominatim + caché en localStorage (`erasmus_city_coords_v1`). Solo hace falta si una ciudad no trae ya sus coordenadas guardadas en Supabase.
- `src/js/map-helpers.js` — **único archivo que conoce Leaflet** (variable global `L`); cambiar proveedor de mapas = reescribir solo este archivo. Contiene `CATEGORY_META` con las categorías de partners y sus colores.
- `src/js/cityMap.js` — módulo reutilizable `mountCityMap(containerId, { pais, ciudad, interactive })`; devuelve una Promise con la instancia del mapa. Primero intenta usar coordenadas ya guardadas en Supabase antes de llamar al geocoder.
- `src/js/mapPartners.js` — UI de la lista de partners + sincronización con marcadores del mapa. Los partners ahora vienen de `partnersService.js` (Supabase), no de un array estático.

## Backend (Supabase)

La base de datos y el panel de administración viven en un proyecto de Supabase (Postgres + Auth). Las ciudades y partners nuevos ya **no se añaden editando código** — se hace desde el panel de administración en `/admin` (ver sección siguiente). Editar `data.js` a mano solo tiene sentido para las páginas que todavía no están migradas.

### Tablas principales

- `cities` — ciudades: nombre, país, bandera, descripción, imagen, coordenadas, link de WhatsApp, si está activa, prioridad de orden.
- `partners` — partners de una ciudad: nombre, categoría, descripción, imagen, coordenadas, si está activo, prioridad.
- `partner_links` — los enlaces de cada partner (web, entradas, WhatsApp, etc.), ligados a `partners` por `partner_id`.
- `cta_clicks` — un registro por cada clic en un enlace de partner, para saber qué se usa más. Se alimenta desde `tracking.js`.
- `admins` — lista de usuarios (por `user_id` de Supabase Auth) que tienen permiso para escribir en las tablas de arriba. **Esto es lo único que decide quién puede editar datos** — no basta con iniciar sesión, hay que estar en esta tabla.

### Seguridad (importante)

Como esta web no tiene servidor propio, la única cosa que protege los datos es la configuración de Postgres (Row Level Security / RLS):
- Cualquier visitante puede **leer** ciudades y partners activos (son públicos, se ven sin iniciar sesión).
- Solo un usuario que esté en la tabla `admins` puede **crear, editar o borrar** ciudades, partners o sus links.
- La "anon key" que aparece en `.env.local` es pública a propósito (viaja al navegador de cualquier visitante) — nunca hay que poner ahí la "service role key", que sí es secreta.
- Antes de tocar políticas de RLS o la tabla `admins`, revisar bien el cambio: un error aquí puede dejar la web sin protección de escritura.

## Panel de administración (`/admin`)

Herramienta interna (no aparece en la navegación pública) para gestionar ciudades y partners sin tocar código:

- **Login**: email + contraseña (Supabase Auth). Solo entran quienes ya tienen cuenta creada y están en la tabla `admins`.
- **Ciudades**: crear, editar, activar/desactivar. El slug se genera automático a partir del nombre.
- **Partners**: crear, editar, activar/desactivar, gestionar sus links (web, entradas, etc.).
- **Extractor de coordenadas**: pegando una URL de Google Maps se rellenan solos los campos de latitud/longitud (`extractCoordsFromGoogleMapsUrl` en `admin.js`).
- **Reporte de clics**: un resumen de los clics registrados en `cta_clicks` durante los últimos 30 días, agrupados por partner.

Todo el HTML/JS que pinta listas dinámicas en el panel escapa los textos que vienen de la base de datos (función `escapeHtml` en `admin.js`) para evitar que un dato mal formado rompa la página o inyecte código.

## Experiencia dual (Verified / Parties)

`src/js/experience.js` es el primer script que carga cada página. Decide qué "experiencia" mostrar:

- Mirando el dominio (`erasmusparties.org` → experiencia "Parties"; cualquier otro dominio → "Verified", que es la experiencia por defecto).
- Se puede forzar en local añadiendo `?exp=parties` o `?exp=verified` a la URL, sin tener que cambiar de dominio.

El resultado se guarda en `window.ERASMUS_EXPERIENCE` para que el resto de scripts lo puedan leer, y se añade una clase (`theme-verified` o `theme-parties`) al `<html>` para pintar los colores correctos.

En la experiencia "Parties" además se ocultan por JS (tras `DOMContentLoaded`) los enlaces a Servicios/Alojamiento/Viajes y el logo cambia a "Erasmus Parties"; se añade un enlace "Verified ↗" en la navegación para volver a la web completa.

## Cómo añadir datos

### Nueva ciudad o partner (forma normal)

Usar el panel de administración en `/admin` (ver sección de arriba). Es la forma recomendada: los datos quedan en Supabase y aparecen automáticamente en home, ciudad y mapa.

### Nueva ciudad o país (páginas todavía no migradas)

Para `ciudades.html` y `ciudades-todas.html`, que aún leen de `data.js`:

1. En `src/js/data.js`, añadir al objeto `COUNTRIES` siguiendo el patrón: `{ flag, heroImg, cardImg, cities: [{ name, img }] }`. Las imágenes son URLs de Unsplash.
2. En `ciudad.html`, añadir la ciudad al objeto `links` al inicio del script inline: `"Nombre Ciudad": { wa: "url_o_null", tg: "url_o_null" }`.
3. Si ambos son `null`, aparece automáticamente el mensaje "Próximamente".

## Mapa interactivo

### `mountCityMap(containerId, { pais, ciudad, interactive })`

- `interactive: true` — usado en **ambas** páginas: `ciudad.html` y `mapa.html`. Ya no hay overlay "toca para interactuar"; el mapa responde directamente al toque/click.

En `ciudad.html` el mapa está dentro de `.city-map-columns` con layout de dos columnas en desktop (75 % mapa / 25 % lista de partners). En móvil el mapa usa `position: sticky` para quedarse visible mientras el usuario hace scroll por la lista.

La variable CSS `--topbar-h` se inyecta dinámicamente en `src/js/ciudad.js` leyendo `header.topbar.offsetHeight`, y la usa tanto el `top` del sticky como el `padding-top` del móvil-nav.

### Geocodificación

`src/js/geocoder.js` llama a la API pública de Nominatim (OpenStreetMap) solo si una ciudad no tiene ya coordenadas guardadas en Supabase, luego las almacena en localStorage. No hay rate limiting implementado — añadir ciudades una a una si se geocodifican en batch.

### Tiles del mapa

CARTO Light (`light_all`) vía CDN. La atribución a OpenStreetMap + CARTO es **obligatoria por licencia** y ya está incluida en `initMap()`.

## Navegación

El proyecto tiene tres patrones de header distintos según la página, más un bottom-nav fijo en móvil:

### Patrones de header

| Patrón | Páginas | Notas |
|--------|---------|-------|
| `header.topbar` | `ciudad.html`, `mapa.html`, `alojamiento.html`, `servicios.html`, `viajes.html` | `position: sticky; z-index: 1001`; fondo con blur |
| `.topnav` | `index.html`, `ciudades-todas.html` | `position: fixed; z-index: 200` (en móvil) |
| `.hero-legacy .topbar` | `ciudades.html` | `position: absolute` sobre foto hero; textos blancos |

Cada página incluye un bloque `<div class="mobile-nav">` (overlay) y el JS inline de hamburger + ítem activo. En móvil este overlay queda oculto (`display: none !important`) porque la navegación la gestiona el bottom-nav.

### Bottom-nav (móvil, `<768px`)

Clase `.app-bottom-nav` — `position: fixed; bottom: 0; height: 60px; z-index: 500`. Presente en las páginas públicas (no en `/admin`, que tiene su propia UI independiente). Cuatro ítems:

1. **Ciudades** → `ciudades-todas.html` (icono `location_city`)
2. **Servicios** → `servicios.html` (icono `storefront`)
3. **Viajes** → `viajes.html` (icono `flight`)
4. **Fiestas** → `https://erasmusparties.org` (icono `nightlife`, color magenta permanente `#e1147b`, `target="_blank"`)

El ítem activo se detecta con `window.location.pathname` y recibe `.app-bottom-nav-item--active`. El JS de detección está en el IIFE inline de cada página (mismo bloque que el hamburger). En móvil el cuerpo tiene `padding-bottom: 68px` para compensar la barra.

### Detección de ítem activo (patrón compartido)

```js
var page = (window.location.pathname.split('/').pop() || 'index.html').split('?')[0] || 'index.html';
// topbar-nav + mobile-nav-links → clase is-active
// app-bottom-nav-item → clase app-bottom-nav-item--active
```

## CSS

Sistema de diseño basado en Material Design 3 (tokens `--md-*`). Variables clave:

- `--primary: #4648d4`, `--secondary: #a93349`
- `--topbar-h` — altura real del `header.topbar`, inyectada por JS en `src/js/ciudad.js`; usada por `top` del mapa sticky y `padding-top` del mobile-nav dropdown
- Tipografía: Syne (display, `--font-display`) + Inter (body, `--font-body`), cargadas desde Google Fonts
- Iconos: Material Symbols Outlined (CDN)
- Contenedor máximo: `1280px`, gutter `24px`

Los alias legacy (`--bg`, `--text`, `--accent`) existen solo para las páginas más antiguas.

### Estructura de `src/css/styles.css`

El archivo está dividido en 10 secciones numeradas. Con Vite ya en marcha, separar estas secciones en archivos independientes es un posible siguiente paso, pero de momento sigue siendo un único fichero:

| § | Nombre | Contenido |
|---|--------|-----------|
| 1 | Design System | `:root` tokens, reset, utilidades, tipografía |
| 2 | Componentes globales | Buttons, badges, cards, forms/inputs, bottom-nav |
| 3 | Layout global | Top nav/header, footer, hero, section wrappers |
| 4 | Index.html | Bento grid, nights section, services section, CTA |
| 5 | Ciudades-todas.html | *(vacío — estilos del hero en `<style>` inline de la página)* |
| 6 | Ciudad.html | Layout de ciudad, mapa embebido, partners list |
| 7 | Mapa.html | `.map-page-main`, `.map-canvas`, `.erasmus-pin__dot`, map-with-list |
| 8 | Servicios.html | `body.servicios-page` (gradiente), `.servicios-category`, `.services-grid--2col` |
| 9 | Viajes.html | `.event-badge--partner`, `body.viajes-page .event-price` |
| 10 | Responsive | Media queries globales que afectan a múltiples secciones |

**Cascada crítica del hamburger:** `@media (max-width: 768px) { .hamburger-btn { display: flex } }` está en §3.1 (antes de §2.5). §2.5 lo sobreescribe con `display: none` porque viene después en el archivo. No invertir este orden.

El panel de administración tiene su propio archivo separado, `src/css/admin.css`, que no sigue esta numeración por secciones (es una herramienta interna, no parte del sitio público).

### Estilos específicos de página

Para añadir CSS exclusivo de una página sin contaminar el global, usar una clase en el `<body>`:

- `servicios.html` → `<body class="servicios-page">` → reglas en §8
- `viajes.html` → `<body class="viajes-page">` → reglas en §9
- `ciudades-todas.html` → bloque `<style>` inline en el `<head>` (excepción deliberada: el hero gradient solo existe en esa página y no justifica clase de body)

### Convenciones de componentes

- **Eyebrows de categoría** (`.eyebrow`): usar siempre `eyebrow--primary` (azul `#4648d4`) para categorías de contenido. `eyebrow--secondary` (rojo `#a93349`) queda reservado para destacar la marca o alertas.
- **CTAs de service-card**: usar `<a class="btn-primary-pill">` en lugar de `<a class="service-link">`. `.service-link` con flecha `arrow_forward` queda descartado.

### Zonas responsivas clave

- `@media (min-width: 900px)` — desktop: ciudad-page max-width 1000px; `.city-map-columns` en fila 75/25
- `@media (max-width: 768px)` — móvil: bottom-nav visible, hamburger y mobile-nav ocultos, `body { padding-bottom: 68px }`
- `@media (max-width: 600px)` — móvil pequeño: grids de 2 columnas

## Dependencias externas

Vía CDN, sin instalación:
- Leaflet 1.9.4 — `unpkg.com`
- Supabase JS SDK (versión UMD) — `cdn.jsdelivr.net`, crea el objeto global `supabase` que usa `supabaseClient.js`
- Google Fonts — Syne + Inter
- Material Symbols Outlined — Google
- Nominatim — API pública de OpenStreetMap (geocodificación)
- Unsplash — imágenes de países y ciudades

Instaladas vía npm (ver `package.json`):
- `vite` + `vite-plugin-static-copy` — build tool
- `@supabase/supabase-js` — cliente de Supabase (aunque en el navegador se usa la versión CDN cargada como `<script>`, no este paquete)
- `prettier` — formateo de código

## Convenciones de commits y ramas

- Commits con prefijo convencional: `feat:`, `fix:`, `refactor:`, `docs:`
- Ramas de feature: `feature/nombre-descriptivo`
- PRs hacia `main`; `main` se despliega automáticamente vía GitHub Pages / Netlify / Vercel
