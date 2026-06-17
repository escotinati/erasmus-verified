# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Erasmus Parties — directorio de grupos de WhatsApp/Telegram para estudiantes Erasmus en 36+ países y 528+ ciudades europeas. También muestra un mapa interactivo con partners (locales nocturnos, alojamientos, etc.) por ciudad.

**Stack**: HTML + CSS + JS vanilla. Sin build step, sin npm, sin dependencias de node. Abrir `index.html` directamente en el navegador o con cualquier servidor HTTP estático.

## Arquitectura

No hay ES Modules. Todo el JS usa `<script>` clásicos con funciones y objetos globales. Esta decisión es intencionada para mantener coherencia entre todos los archivos.

### Páginas y sus scripts

| Página | Script | Propósito |
|--------|--------|-----------|
| `index.html` | `js/index.js` | Autocomplete de búsqueda, bento grid de países |
| `ciudad.html` | `js/ciudad.js` | Detalle de ciudad, botones WhatsApp/Telegram |
| `ciudades.html` | `js/ciudades.js` | Grid de ciudades de un país |
| `mapa.html` | `js/mapa.js` | Mapa a pantalla completa con lista de partners |

### Módulos compartidos (cargados donde se necesitan)

- `js/data.js` — objeto global `COUNTRIES` con todos los países y ciudades
- `js/geocoder.js` — cliente Nominatim + caché en localStorage (`erasmus_city_coords_v1`)
- `js/map-helpers.js` — **único archivo que conoce Leaflet** (variable global `L`); cambiar proveedor de mapas = reescribir solo este archivo
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
  category: 'nightlife',   // una de las 5: nightlife | housing | services | community | travel
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

Las 5 categorías y sus colores están definidas en `CATEGORY_META` dentro de `js/map-helpers.js`.

## Mapa interactivo

### `mountCityMap(containerId, { pais, ciudad, interactive })`

- `interactive: false` — modo embebido (ciudad.html): bloquea zoom/pan hasta que el usuario toca el overlay
- `interactive: true` — pantalla completa (mapa.html): sin overlay

### Geocodificación

`js/geocoder.js` llama a la API pública de Nominatim (OpenStreetMap) la primera vez que se necesitan coordenadas de una ciudad, luego las almacena en localStorage. No hay rate limiting implementado — añadir ciudades una a una si se geocodifican en batch.

### Tiles del mapa

CARTO Light (`light_all`) vía CDN. La atribución a OpenStreetMap + CARTO es **obligatoria por licencia** y ya está incluida en `initMap()`.

## CSS

Sistema de diseño basado en Material Design 3 (tokens `--md-*`). Variables clave:

- `--primary: #4648d4`, `--secondary: #a93349`
- Tipografía: Syne (display) + Inter (body), cargadas desde Google Fonts
- Iconos: Material Symbols Outlined (CDN)
- Contenedor máximo: `1280px`, gutter `24px`

Los alias legacy (`--bg`, `--text`, `--accent`) existen solo para las páginas más antiguas.

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
