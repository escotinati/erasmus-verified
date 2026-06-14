// ─────────────────────────────────────────────────────────────
//  MAPA.JS — Erasmus Parties
//  Orquestador de mapa.html. Lee ?pais= y ?ciudad= de la URL,
//  valida contra COUNTRIES, y centra el mapa usando getCityCoords()
//  (geocoder.js) con caché en localStorage.
// ─────────────────────────────────────────────────────────────

const params = new URLSearchParams(window.location.search);
const pais = params.get('pais') || '';
const ciudad = params.get('ciudad') || '';
const country = COUNTRIES[pais];

if (!pais || !ciudad || !country) {
    document.querySelector('.map-page-main').innerHTML = `
    <div style="text-align:center;padding:60px 20px;color:var(--on-surface-variant);">
      <span style="font-size:2.5rem;display:block;margin-bottom:16px;">😵</span>
      <h2 style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--on-surface);margin-bottom:8px;">Ciudad no encontrada</h2>
      <p>Vuelve al inicio y selecciona tu destino.</p>
      <a href="index.html" style="display:inline-block;margin-top:20px;color:var(--primary);">← Inicio</a>
    </div>`;
} else {
    document.title = `Mapa de ${ciudad}, ${pais} — Erasmus Parties`;

    // Navegación (sin cambios respecto a la versión anterior)
    document.getElementById('breadcrumbPais').textContent = pais;
    document.getElementById('breadcrumbPaisLink').href = `ciudades.html?pais=${encodeURIComponent(pais)}`;
    document.getElementById('breadcrumbCiudad').textContent = ciudad;
    document.getElementById('breadcrumbCiudadLink').href = `ciudad.html?pais=${encodeURIComponent(pais)}&ciudad=${encodeURIComponent(ciudad)}`;
    document.getElementById('backLink').href = `ciudad.html?pais=${encodeURIComponent(pais)}&ciudad=${encodeURIComponent(ciudad)}`;
    document.getElementById('backLinkText').textContent = ciudad;

    // Mostrar estado de carga mientras llegan las coordenadas
    const mapEl = document.getElementById('map');
    mapEl.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--on-surface-variant);">
      <p>Cargando mapa de ${ciudad}…</p>
    </div>`;

    // getCityCoords es async (puede llamar a Nominatim la primera vez)
    getCityCoords(ciudad, pais).then((coords) => {
        if (!coords) {
            mapEl.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--on-surface-variant);">
          <span style="font-size:2.5rem;display:block;margin-bottom:16px;">🗺️</span>
          <h2 style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--on-surface);margin-bottom:8px;">Mapa no disponible</h2>
          <p>No hemos podido localizar ${ciudad} en este momento. Inténtalo de nuevo más tarde.</p>
        </div>`;
            return;
        }

        // El div #map fue sustituido por el mensaje de "Cargando…"; Leaflet
        // necesita el contenedor vacío y con altura, así que lo limpiamos.
        mapEl.innerHTML = '';
        initMap('map', coords);
        addMarker(coords, { label: ciudad, color: '#e1147b' });
    });
}