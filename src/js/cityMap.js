// ─────────────────────────────────────────────────────────────
//  CITYMAP.JS — Erasmus Parties
//
//  Módulo único de "mapa de ciudad", usado por ciudad.html (embebido)
//  y mapa.html (pantalla completa). Encapsula geocodificación +
//  inicialización de Leaflet para que ninguna página repita esta lógica.
//
//  API: mountCityMap(containerId, { pais, ciudad, lat, lng })
//   - containerId: id del <div> donde se monta el mapa
//   - pais, ciudad: para geocodeo y el pin principal
//
//  El mapa arranca siempre interactivo (pan/zoom directo al primer
//  toque, sin overlay de activación) — tanto en mapa.html (pantalla
//  completa) como en el mapa embebido de ciudad.html, que en móvil ya
//  no comparte scroll con la página: vive dentro de un contenedor de
//  altura fija con un panel arrastrable encima (ver citySheet.js), no
//  en el flujo normal de la página. El antiguo overlay "Toca para
//  interactuar" (gesto-gate) existía justo para el caso contrario, un
//  mapa sticky compitiendo con el scroll de página — ya no aplica.
//
//  Devuelve una Promise que resuelve cuando el mapa está listo (o null
//  si no se pudo geocodificar la ciudad).
// ─────────────────────────────────────────────────────────────

async function mountCityMap(containerId, { pais, ciudad, lat, lng }) {
    const container = document.getElementById(containerId);

    // Sin forma de card reconocible (es un mapa) — un único bloque
    // relleno del contenedor. El texto "Cargando mapa de {ciudad}…"
    // solo era necesario cuando esto tardaba (geocodeo real vía
    // Nominatim); con lat/lng ya guardados en Supabase (el caso
    // habitual) esta espera es casi siempre instantánea de todas
    // formas.
    Skeleton.render(container, 1, () => Skeleton.block('skeleton--block'));

    let coords = null;

    if (lat && lng) {
        coords = { lat, lng };
    } else {
        coords = await getCityCoords(ciudad, pais);
    }

    if (!coords) {
        Skeleton.clear(container);
        container.innerHTML = `
      <div class="city-map-error">
        <span class="city-map-error__icon">🗺️</span>
        <p>${I18n.t('map.city_not_located_prefix')} ${escapeHtml(ciudad)} ${I18n.t('map.city_not_located_suffix')}</p>
      </div>`;
        return null;
    }

    Skeleton.clear(container);
    container.innerHTML = ''; // Leaflet necesita el contenedor vacío

    const map = initMap(containerId, coords);
    addMarker(coords, { label: ciudad, color: '#e1147b' });

    // (Fase 2, futuro): aquí se añadirán pines de partners filtrados
    // por `ciudad`, reutilizando addMarker() con color por categoría.

    return map;
}
