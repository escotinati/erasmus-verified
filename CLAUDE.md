# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

**Erasmus Verified** — directorio de grupos de WhatsApp/Telegram para estudiantes Erasmus en 36+ países y 528+ ciudades europeas. También muestra un mapa interactivo con partners (locales nocturnos, alojamientos, etc.) por ciudad.

> **Nomenclatura de marca**: el nombre público es "Erasmus Verified". "Erasmus Parties" es una sub-sección que apunta a `erasmusparties.org` (enlace externo en el nav, color magenta `#e1147b`). No cambiar las etiquetas de los grupos de WhatsApp/Telegram — son nombres de datos, no de marca.

**Stack**: HTML + CSS + JS vanilla. Sin build step. Abrir `index.html` directamente en el navegador o con cualquier servidor HTTP estático.

**Herramientas de desarrollo**: Prettier instalado como devDependency (`npm install` para instalar). Configuración en `.prettierrc`: 4 espacios, comillas simples, semi. Un hook de Claude Code formatea automáticamente JS/CSS/HTML tras cada edición — no hace falta ejecutarlo manualmente.

## Arquitectura

No hay ES Modules. Todo el JS usa `<script>` clásicos con funciones y objetos globales. Esta decisión es intencionada para mantener coherencia entre todos los archivos.

### Páginas y sus scripts

| Página | Script | Propósito |
|--------|--------|-----------|
| `index.html` | `js/index.js` | Autocomplete de búsqueda, bento grid de países |
| `ciudades-todas.html` | inline | Listado completo de ciudades con filtro alfabético |
| `ciudades.html` | `js/ciudades.js` | Grid de ciudades de un país (hero con foto) |
| `ciudad.html` | `js/ciudad.js` | Detalle de ciudad, botones WhatsApp/Telegram, mapa embebido |
| `mapa.html` | `js/mapa.js` | Mapa a pantalla completa con lista de partners |
| `servicios.html` | inline | Servicios verificados: SIM, banca, transporte |
| `viajes.html` | inline | Viajes en grupo para estudiantes Erasmus |

### Módulos compartidos (cargados donde se necesitan)

- `js/data.js` — objeto global `COUNTRIES` con todos los países y ciudades
- `js/geocoder.js` — cliente Nominatim + caché en localStorage (`erasmus_city_coords_v1`)
- `js/map-helpers.js` — **único archivo que conoce Leaflet** (variable global `L`); cambiar proveedor de mapas = reescribir solo este archivo. Contiene `CATEGORY_META` con las categorías de partners y sus colores.
- `js/cityMap.js` — módulo reutilizable `mountCityMap(containerId, { pais, ciudad, interactive })`; devuelve una Promise con la instancia del mapa
- `js/partners.js` — array global `PARTNERS` + funciones `getPartnersByCity(ciudad)` y `groupPartnersByCategory(partners)`
- `js/mapPartners.js` — UI de la lista de partners + sincronización con marcadores del mapa

## Cómo añadir datos

### Nueva ciudad o país

1. En `js/data.js`, añadir al objeto `COUNTRIES` siguiendo el patrón: `{ flag, heroImg, cardImg, cities: [{ name, img }] }`. Las imágenes son URLs de Unsplash.
2. En `ciudad.html`, añadir la ciudad al objeto `links` al inicio del script inline: `"Nombre Ciudad": { wa: "url_o_null", tg: "url_o_null" }`.
3. Si ambos son `null`, aparece automáticamente el mensaje "Próximamente".

### Nuevo partner

Añadir un objeto al array `PARTNERS` en `js/partners.js`:

```js
{
  id: 'p-slug-unico',      // kebab-case, prefijo "p-"
  name: 'Nombre del Local',
  category: 'nightlife',   // ver CATEGORY_META en js/map-helpers.js para la lista completa
  pais: 'España',
  ciudad: 'Nombre Ciudad', // debe coincidir exactamente con el campo `name` en data.js
  lat: 43.26434,
  lng: -2.92756,
  description: 'Descripción corta.',
  links: [
    { type: 'WEBSITE', label: 'Web oficial', url: 'https://...' },
    // type: 'TICKETS' | 'OWN_EVENT' también disponibles
  ],
}
```

Todas las categorías definidas en `CATEGORY_META` aparecen siempre en el acordeón (vacías o no).

## Mapa interactivo

### `mountCityMap(containerId, { pais, ciudad, interactive })`

- `interactive: true` — usado en **ambas** páginas: `ciudad.html` y `mapa.html`. Ya no hay overlay "toca para interactuar"; el mapa responde directamente al toque/click.

En `ciudad.html` el mapa está dentro de `.city-map-columns` con layout de dos columnas en desktop (75 % mapa / 25 % lista de partners). En móvil el mapa usa `position: sticky` para quedarse visible mientras el usuario hace scroll por la lista.

La variable CSS `--topbar-h` se inyecta dinámicamente en `ciudad.js` leyendo `header.topbar.offsetHeight`, y la usa tanto el `top` del sticky como el `padding-top` del móvil-nav.

### Geocodificación

`js/geocoder.js` llama a la API pública de Nominatim (OpenStreetMap) la primera vez que se necesitan coordenadas de una ciudad, luego las almacena en localStorage. No hay rate limiting implementado — añadir ciudades una a una si se geocodifican en batch.

### Tiles del mapa

CARTO Light (`light_all`) vía CDN. La atribución a OpenStreetMap + CARTO es **obligatoria por licencia** y ya está incluida en `initMap()`.

## Navegación

El proyecto tiene tres patrones de header distintos según la página, más un bottom-nav fijo en móvil:

### Patrones de header

| Patrón | Páginas | Notas |
|--------|---------|-------|
| `header.topbar` | `ciudad.html`, `mapa.html`, `servicios.html`, `viajes.html` | `position: sticky; z-index: 1001`; fondo con blur |
| `.topnav` | `index.html`, `ciudades-todas.html` | `position: fixed; z-index: 200` (en móvil) |
| `.hero-legacy .topbar` | `ciudades.html` | `position: absolute` sobre foto hero; textos blancos |

Cada página incluye un bloque `<div class="mobile-nav">` (overlay) y el JS inline de hamburger + ítem activo. En móvil este overlay queda oculto (`display: none !important`) porque la navegación la gestiona el bottom-nav.

### Bottom-nav (móvil, `<768px`)

Clase `.app-bottom-nav` — `position: fixed; bottom: 0; height: 60px; z-index: 500`. Presente en las 7 páginas. Cuatro ítems:

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
- `--topbar-h` — altura real del `header.topbar`, inyectada por JS en `ciudad.js`; usada por `top` del mapa sticky y `padding-top` del mobile-nav dropdown
- Tipografía: Syne (display, `--font-display`) + Inter (body, `--font-body`), cargadas desde Google Fonts
- Iconos: Material Symbols Outlined (CDN)
- Contenedor máximo: `1280px`, gutter `24px`

Los alias legacy (`--bg`, `--text`, `--accent`) existen solo para las páginas más antiguas.

### Estructura de `css/styles.css`

El archivo está dividido en 10 secciones numeradas, preparado para separar en archivos independientes cuando se migre a Vite:

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

## Dependencias externas (todas vía CDN, sin instalación)

- Leaflet 1.9.4 — `unpkg.com`
- Google Fonts — Syne + Inter
- Material Symbols Outlined — Google
- Nominatim — API pública de OpenStreetMap (geocodificación)
- Unsplash — imágenes de países y ciudades

## Convenciones de commits y ramas

- Commits con prefijo convencional: `feat:`, `fix:`, `refactor:`, `docs:`
- Ramas de feature: `feature/nombre-descriptivo`
- PRs hacia `main`; `main` se despliega automáticamente vía GitHub Pages / Netlify / Vercel
