// ─────────────────────────────────────────────────────────────
//  CITYMAP.JS — Erasmus Parties
//
//  Módulo único de "mapa de ciudad", usado por ciudad.html (embebido)
//  y mapa.html (pantalla completa). Encapsula geocodificación +
//  inicialización de Leaflet para que ninguna página repita esta lógica.
//
//  API: mountCityMap(containerId, { pais, ciudad, lat, lng, interactive })
//   - containerId: id del <div> donde se monta el mapa
//   - pais, ciudad: para geocodeo y el pin principal
//   - interactive: si es false, el mapa empieza "bloqueado" (sin zoom/pan)
//     y muestra un overlay "Toca para interactuar" — pensado para el
//     mapa EMBEBIDO en ciudad.html en móvil.
//
//  Por qué sigue haciendo falta con el panel arrastrable (CitySheet):
//  se probó a quitarlo asumiendo que un contenedor de altura fija ya
//  no competía con el scroll de página — falso en la práctica. Leaflet
//  hace preventDefault() en touchmove para paneear el mapa; eso
//  secuestra CUALQUIER swipe vertical que empiece sobre el mapa, y el
//  mapa sigue ocupando casi toda la pantalla (hay contenido real
//  encima y debajo, a diferencia de mapa.html, que es la página
//  entera). Sin este gate, un usuario no puede hacer scroll de página
//  con un dedo que empiece sobre el mapa. Si es true (mapa.html,
//  pantalla completa — ahí no hay nada que hacer scroll más allá del
//  propio mapa — y el mapa embebido en desktop, columna fija sin este
//  conflicto), no hay overlay.
//
//  Devuelve una Promise que resuelve cuando el mapa está listo (o null
//  si no se pudo geocodificar la ciudad).
// ─────────────────────────────────────────────────────────────

async function mountCityMap(containerId, { pais, ciudad, lat, lng, interactive = true }) {
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

    if (!interactive) {
        // Bloquea gestos que compiten con el scroll de la página.
        // El usuario "activa" el mapa con un tap; a partir de ahí
        // se comporta como un mapa normal.
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.touchZoom.disable();

        const overlay = document.createElement('button');
        overlay.type = 'button';
        overlay.className = 'city-map-activate';
        overlay.textContent = I18n.t('map.tap_to_interact');
        overlay.addEventListener(
            'click',
            () => {
                map.dragging.enable();
                map.scrollWheelZoom.enable();
                map.doubleClickZoom.enable();
                map.touchZoom.enable();
                overlay.remove();
            },
            { once: true }
        );

        // `container` (.city-map-embed) ya es position:absolute (ver
        // ciudad.css, composición mapa+sheet) — contexto de
        // posicionamiento válido de sobra para este overlay
        // absolute/inset:0, sin necesitar ningún ajuste extra.
        container.appendChild(overlay);
    }

    // (Fase 2, futuro): aquí se añadirán pines de partners filtrados
    // por `ciudad`, reutilizando addMarker() con color por categoría.

    return map;
}
