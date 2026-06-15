// ─────────────────────────────────────────────────────────────
//  MAPA.JS — Erasmus Parties
//  Orquestador de mapa.html (vista a pantalla completa).
//  Toda la lógica de mapa vive en cityMap.js, compartida con
//  el mapa embebido de ciudad.html.
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

    document.getElementById('breadcrumbPais').textContent = pais;
    document.getElementById('breadcrumbPaisLink').href = `ciudades.html?pais=${encodeURIComponent(pais)}`;
    document.getElementById('breadcrumbCiudad').textContent = ciudad;
    document.getElementById('breadcrumbCiudadLink').href = `ciudad.html?pais=${encodeURIComponent(pais)}&ciudad=${encodeURIComponent(ciudad)}`;
    document.getElementById('backLink').href = `ciudad.html?pais=${encodeURIComponent(pais)}&ciudad=${encodeURIComponent(ciudad)}`;
    document.getElementById('backLinkText').textContent = ciudad;

    // Pantalla completa: interactive=true desde el primer momento,
    // sin overlay "toca para interactuar" (aquí el usuario ya quiere el mapa).
    mountCityMap('map', { pais, ciudad, interactive: true });
}