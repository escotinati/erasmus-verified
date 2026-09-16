// ─────────────────────────────────────────────────────────────
//  CITYMAP.JS — Erasmus Parties
//
//  Módulo único de "mapa de ciudad". Encapsula geocodificación +
//  inicialización de Leaflet para que ninguna página repita esta
//  lógica. Hoy solo lo llama mapa.js (pantalla completa) — ciudad.html
//  ya no tiene mapa embebido (rama feature/city-no-map, ver
//  cityPartners.js); este módulo se queda igual porque mapa.html sigue
//  necesitándolo tal cual.
//
//  API: mountCityMap(containerId, { pais, ciudad, lat, lng, interactive })
//   - containerId: id del <div> donde se monta el mapa
//   - pais, ciudad: para geocodeo y el pin principal
//   - interactive: si es false, el mapa empieza "bloqueado" (sin zoom/pan)
//     y muestra un overlay "Toca para interactuar". Pensado en su día
//     para el mapa embebido de ciudad.html en móvil (evitar que Leaflet
//     secuestrase el scroll de página) — mapa.js siempre pasa `true`
//     (pantalla completa, nada que hacer scroll más allá del propio
//     mapa), así que esta rama no se ejecuta hoy en ningún caso real.
//     Se deja tal cual (no es código muerto de verdad: sigue siendo
//     parte de la API pública del módulo) por si un futuro mapa
//     embebido vuelve a necesitarlo.
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

        // El overlay es absolute/inset:0 — necesita que `container` ya
        // tenga su propio contexto de posicionamiento (relative/
        // absolute) puesto por quien llame a mountCityMap(), esta
        // función no se lo añade.
        container.appendChild(overlay);
    }

    // (Fase 2, futuro): aquí se añadirán pines de partners filtrados
    // por `ciudad`, reutilizando addMarker() con color por categoría.

    return map;
}
