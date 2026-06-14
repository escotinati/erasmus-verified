// ─────────────────────────────────────────────────────────────
//  MAP-HELPERS.JS — Erasmus Parties
//
//  ÚNICO archivo del proyecto que conoce Leaflet (variable global L,
//  cargada por <script> en mapa.html). El resto de la app habla con
//  estas funciones. Cambiar de proveedor de mapas = reescribir solo
//  este archivo.
//
//  Expuesto como funciones globales (sin export/import) para mantener
//  consistencia con el resto del proyecto: data.js, coords.js y mapa.js
//  son scripts clásicos, no ES Modules.
// ─────────────────────────────────────────────────────────────

let map = null;

/**
 * Inicializa el mapa centrado en `center` ({lat, lng}) con el zoom dado.
 * Añade la capa de tiles CARTO (gratis, atribución obligatoria por licencia).
 */
function initMap(containerId, center, zoom = 14) {
  map = L.map(containerId, { center: [center.lat, center.lng], zoom });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  }).addTo(map);

  return map;
}

/**
 * Añade un pin en `{lat, lng}`. `label` es el tooltip nativo (accesibilidad
 * y hover). `color` define el color del pin vía CSS custom property.
 * Devuelve el marker de Leaflet por si se necesita más adelante
 * (p. ej. para asociarle un popup en la Fase C).
 */
function addMarker({ lat, lng }, { label, color = '#4648d4' } = {}) {
  const icon = L.divIcon({
    className: 'erasmus-pin',
    html: `<span class="erasmus-pin__dot" style="--pin-color:${color}"></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24], // la punta del pin marca la coordenada exacta
  });

  const marker = L.marker([lat, lng], { icon, title: label || '' });
  marker.addTo(map);
  return marker;
}
