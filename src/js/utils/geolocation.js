// ─────────────────────────────────────────────────────────────
//  GEOLOCATION.JS — Erasmus Verified / Erasmus Parties
//
//  Ubicación del navegador + distancia a un partner, para el "a 800 m"
//  que muestran cityPartners.js (ciudad.html, sin mapa) y
//  mapPartners.js (mapa.html) junto a cada partner. Sin ES Modules,
//  como el resto del proyecto: funciones globales en window.
//
//  getUserLocation() se pide automáticamente al cargar la lista de
//  partners (decisión de producto, no técnica — ver CLAUDE.md si se
//  documenta ahí) — nunca rechaza la Promise: sin geolocalización
//  (denegada, no soportada, timeout, error del navegador...) resuelve
//  null en vez de forzar un catch en cada llamador, mismo criterio que
//  sanitizeUrl() devolviendo un fallback en vez de lanzar. Quien la
//  llama simplemente no añade distancia si el resultado es null.
// ─────────────────────────────────────────────────────────────

function getUserLocation() {
    return new Promise((resolve) => {
        if (!('geolocation' in navigator)) {
            resolve(null);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            // enableHighAccuracy:false — de sobra para distancias a
            // nivel de ciudad, más rápido y menos batería que GPS fino.
            // maximumAge acepta una posición cacheada reciente del propio
            // navegador (ej. si el usuario ya dio permiso en otra
            // pestaña) en vez de forzar una lectura nueva cada vez.
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 }
        );
    });
}

// Fórmula de Haversine — distancia en metros entre dos puntos lat/lng.
function distanceMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// "800 m" / "1,2 km" (formato numérico por idioma vía I18n.getLang(),
// ya existente en i18n.js — no hace falta ninguna clave nueva en
// translations.js, "m"/"km" son universales). Por debajo de 1km,
// redondeo a la decena más próxima (evita falsa precisión tipo "847
// m", que nadie necesita para saber si un partner está cerca).
function formatDistance(meters) {
    const locale = I18n.getLang() === 'es' ? 'es-ES' : 'en-GB';
    if (meters < 1000) {
        const rounded = Math.round(meters / 10) * 10;
        return `${rounded} m`;
    }
    const km = meters / 1000;
    return `${km.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
}

window.getUserLocation = getUserLocation;
window.distanceMeters = distanceMeters;
window.formatDistance = formatDistance;
