// ─────────────────────────────────────────────────────────────
//  GEOCODER.JS — Erasmus Parties
//
//  Sustituye a CITY_COORDS (coords.js). En lugar de mantener a mano
//  las coordenadas de las 491 ciudades de data.js, las pedimos a
//  Nominatim (OpenStreetMap, gratuito) la primera vez y las guardamos
//  en localStorage. Las siguientes visitas a esa ciudad son instantáneas
//  y no hacen ninguna petición de red.
//
//  Expuesto como función global getCityCoords(), igual que el resto
//  de helpers del proyecto (data.js, map-helpers.js): scripts clásicos,
//  sin import/export.
// ─────────────────────────────────────────────────────────────

const COORDS_CACHE_KEY = 'erasmus_city_coords_v1';

/** Lee la caché completa de localStorage (objeto { "Ciudad|País": {lat,lng} }) */
function readCoordsCache() {
    try {
        return JSON.parse(localStorage.getItem(COORDS_CACHE_KEY)) || {};
    } catch {
        return {};
    }
}

function writeCoordsCache(cache) {
    try {
        localStorage.setItem(COORDS_CACHE_KEY, JSON.stringify(cache));
    } catch {
        // localStorage lleno o bloqueado (modo privado): seguimos sin caché,
        // no es crítico, solo perdemos la persistencia entre visitas.
    }
}

/**
 * Devuelve { lat, lng } para `ciudad, pais`, o null si no se encuentra.
 *
 * 1. Si está en caché (localStorage), la devuelve al instante.
 * 2. Si no, pregunta a Nominatim, la guarda en caché y la devuelve.
 *
 * Es async porque la primera consulta de cada ciudad requiere red.
 * mapa.js debe usar await / .then().
 */
async function getCityCoords(ciudad, pais) {
    const key = `${ciudad}|${pais}`;
    const cache = readCoordsCache();

    if (cache[key]) {
        return cache[key];
    }

    try {
        const query = encodeURIComponent(`${ciudad}, ${pais}`);
        // Nominatim: servicio gratuito de OSM. Política de uso exige
        // identificarse y no abusar (máx ~1 req/seg) — la caché en
        // localStorage hace que cada ciudad se pida como máximo una vez
        // por navegador.
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`;

        const res = await fetch(url, {
            headers: { 'Accept-Language': 'es' },
        });
        if (!res.ok) throw new Error(`Nominatim respondió ${res.status}`);

        const results = await res.json();
        if (!results.length) return null;

        const coords = {
            lat: parseFloat(results[0].lat),
            lng: parseFloat(results[0].lon),
        };

        cache[key] = coords;
        writeCoordsCache(cache);
        return coords;
    } catch (err) {
        console.error('[geocoder] No se pudieron obtener coordenadas:', err);
        return null;
    }
}