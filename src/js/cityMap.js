// ─────────────────────────────────────────────────────────────
//  CITYMAP.JS — Erasmus Parties
//
//  Módulo único de "mapa de ciudad", usado por ciudad.html (embebido)
//  y mapa.html (pantalla completa). Encapsula geocodificación +
//  inicialización de Leaflet para que ninguna página repita esta lógica.
//
//  API: mountCityMap(containerId, { pais, ciudad, interactive })
//   - containerId: id del <div> donde se monta el mapa
//   - pais, ciudad: para geocodeo y el pin principal
//   - interactive: si es false, el mapa empieza "bloqueado" (sin zoom/pan)
//     y muestra un overlay "Toca para interactuar" — pensado para el
//     mapa EMBEBIDO en ciudad.html, donde el usuario hace scroll por
//     encima. Si es true (mapa.html, pantalla completa), no hay overlay.
//
//  Devuelve una Promise que resuelve cuando el mapa está listo (o null
//  si no se pudo geocodificar la ciudad).
// ─────────────────────────────────────────────────────────────

async function mountCityMap(containerId, { pais, ciudad, lat, lng, interactive = true }) {
    const container = document.getElementById(containerId);

    container.innerHTML = `
    <div class="city-map-loading">
      <p>Cargando mapa de ${ciudad}…</p>
    </div>`;

    let coords = null;

    if (lat && lng) {
        coords = { lat, lng };
    } else {
        coords = await getCityCoords(ciudad, pais);
    }

    if (!coords) {
        container.innerHTML = `
      <div class="city-map-error">
        <span class="city-map-error__icon">🗺️</span>
        <p>No hemos podido localizar ${ciudad} en este momento.</p>
      </div>`;
        return null;
    }

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
        overlay.textContent = 'Toca para interactuar con el mapa';
        overlay.addEventListener('click', () => {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.touchZoom.enable();
            overlay.remove();
        }, { once: true });

        container.style.position = 'relative';
        container.appendChild(overlay);
    }

    // (Fase 2, futuro): aquí se añadirán pines de partners filtrados
    // por `ciudad`, reutilizando addMarker() con color por categoría.

    return map;
}