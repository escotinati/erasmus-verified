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


/**
 * Metadatos visuales por categoría. nightlife en azul, según lo acordado.
 * Las demás categorías quedan definidas para cuando tengan partners reales.
 */
const CATEGORY_META = {
    nightlife: { label: 'Nightlife', color: '#2563eb' }, // azul
    housing: { label: 'Alojamiento', color: '#0e7490' },
    services: { label: 'Servicios', color: '#ca8a04' },
    community: { label: 'Comunidad', color: '#16a34a' },
    travel: { label: 'Viajes', color: '#7c3aed' },
};

/**
 * Crea (sin añadir al mapa) un marker de partner, con icono de categoría.
 * `expanded` controla el tamaño (acordeón: solo uno expandido a la vez).
 * Devuelve el marker de Leaflet para que mapPartners.js controle
 * cuándo añadirlo/quitarlo del mapa y cuándo cambiar su tamaño.
 */
function createPartnerMarker(partner, { expanded = false } = {}) {
    const meta = CATEGORY_META[partner.category] || { color: '#64748b' };
    const size = expanded ? 34 : 24;

    const icon = L.divIcon({
        className: 'partner-pin' + (expanded ? ' partner-pin--expanded' : ''),
        html: `<span class="partner-pin__dot" style="--pin-color:${meta.color}"></span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
    });

    return L.marker([partner.lat, partner.lng], { icon, title: partner.name });
}

/**
 * Cambia el tamaño de un marker ya creado, sin recrearlo desde cero.
 * Se usa al expandir/contraer un partner (acordeón).
 */
function setMarkerExpanded(marker, partner, expanded) {
    const meta = CATEGORY_META[partner.category] || { color: '#64748b' };
    const size = expanded ? 34 : 24;

    marker.setIcon(L.divIcon({
        className: 'partner-pin' + (expanded ? ' partner-pin--expanded' : ''),
        html: `<span class="partner-pin__dot" style="--pin-color:${meta.color}"></span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
    }));
}