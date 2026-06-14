// ─────────────────────────────────────────────────────────────
//  MAPA.JS — Erasmus Parties
//  Orquestador de mapa.html. Mismo patrón que ciudad.js:
//  lee ?pais= y ?ciudad= de la URL, valida contra COUNTRIES,
//  y centra el mapa usando CITY_COORDS (Fase A).
// ─────────────────────────────────────────────────────────────

const params  = new URLSearchParams(window.location.search);
const pais    = params.get('pais')   || '';
const ciudad  = params.get('ciudad') || '';
const country = COUNTRIES[pais];
const coords  = CITY_COORDS[ciudad];

if (!pais || !ciudad || !country) {
  // Mismo patrón de error que ciudad.js para país/ciudad no encontrados
  document.querySelector('.map-page-main').innerHTML = `
    <div style="text-align:center;padding:60px 20px;color:var(--on-surface-variant);">
      <span style="font-size:2.5rem;display:block;margin-bottom:16px;">😵</span>
      <h2 style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--on-surface);margin-bottom:8px;">Ciudad no encontrada</h2>
      <p>Vuelve al inicio y selecciona tu destino.</p>
      <a href="index.html" style="display:inline-block;margin-top:20px;color:var(--primary);">← Inicio</a>
    </div>`;
} else {
  document.title = `Mapa de ${ciudad}, ${pais} — Erasmus Parties`;

  // Navegación (mismo patrón que ciudad.js)
  document.getElementById('breadcrumbPais').textContent   = pais;
  document.getElementById('breadcrumbPaisLink').href      = `ciudades.html?pais=${encodeURIComponent(pais)}`;
  document.getElementById('breadcrumbCiudad').textContent = ciudad;
  document.getElementById('breadcrumbCiudadLink').href    = `ciudad.html?pais=${encodeURIComponent(pais)}&ciudad=${encodeURIComponent(ciudad)}`;
  document.getElementById('backLink').href                = `ciudad.html?pais=${encodeURIComponent(pais)}&ciudad=${encodeURIComponent(ciudad)}`;
  document.getElementById('backLinkText').textContent     = ciudad;

  if (!coords) {
    // Ciudad válida en COUNTRIES pero sin entrada en CITY_COORDS
    // (no debería pasar tras la Fase A, pero se gestiona por si acaso)
    document.querySelector('.map-page-main').innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--on-surface-variant);">
        <span style="font-size:2.5rem;display:block;margin-bottom:16px;">🗺️</span>
        <h2 style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--on-surface);margin-bottom:8px;">Mapa no disponible</h2>
        <p>Todavía no tenemos coordenadas para ${ciudad}.</p>
      </div>`;
  } else {
    initMap('map', coords);
    addMarker(coords, { label: ciudad, color: '#e1147b' });
  }
}
