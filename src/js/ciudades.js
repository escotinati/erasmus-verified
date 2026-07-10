// ─────────────────────────────────────────────────────────────
//  CIUDADES.JS — Erasmus Verified / Erasmus Parties
//
//  Grid de ciudades de un país. Antes leía del objeto estático
//  COUNTRIES (data.js); ahora pide el directorio completo a Supabase
//  vía fetchAllCities() (citiesService.js) y filtra en cliente por
//  país — así se ven TODAS las ciudades del país, tengan o no grupo
//  activo todavía (directorio completo, no solo active=true).
// ─────────────────────────────────────────────────────────────

const ARROW_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>`;

// Mismo criterio anti-XSS que el resto del proyecto (admin.js):
// name/image_url ya son editables desde el admin, no datos estáticos
// de confianza como antes.
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
}

async function initCiudadesPage() {
    const params = new URLSearchParams(window.location.search);
    const paisName = params.get('pais') || '';

    const allCities = await fetchAllCities();
    const cities = allCities
        .filter((c) => c.country === paisName)
        .sort((a, b) => a.name.localeCompare(b.name, 'es'));

    if (!paisName || cities.length === 0) {
        document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                color:var(--on-surface-variant);font-family:'Inter',sans-serif;font-size:15px;">
      País no encontrado.&nbsp;
      <a href="index.html" style="color:var(--primary);">Volver al inicio</a>
    </div>`;
        return;
    }

    document.title = `${paisName} — Erasmus Verified`;

    // No hay ya un "hero image" propio del país (data.js lo tenía como
    // country.heroImg, un campo que no existe en la tabla cities) — se
    // usa la imagen de la primera ciudad (orden alfabético) como fondo,
    // mejor que dejarlo vacío.
    const heroBg = document.getElementById('heroBg');
    if (heroBg && cities[0].image_url) heroBg.style.backgroundImage = `url('${cities[0].image_url}')`;

    const heroFlag = document.getElementById('heroFlag');
    const heroTitle = document.getElementById('heroTitle');
    const heroCityCount = document.getElementById('heroCityCount');
    const sectionCount = document.getElementById('sectionCount');

    if (heroFlag) heroFlag.textContent = cities[0].flag || '';
    if (heroTitle) heroTitle.textContent = paisName;
    if (heroCityCount) heroCityCount.textContent = `${cities.length} ciudades disponibles`;
    if (sectionCount) sectionCount.textContent = `${cities.length} ciudades`;

    const grid = document.getElementById('citiesGrid');
    const count = cities.length;
    if (count <= 3) grid.classList.add('cols-3');
    if (count === 2) grid.classList.add('cols-2');

    grid.innerHTML = cities
        .map(
            (city) => `
    <a class="city-card" href="ciudad.html?ciudad=${city.id}">
      <img class="card-img" src="${escapeHtml(city.image_url)}" alt="${escapeHtml(city.name)}" loading="lazy"/>
      <div class="card-overlay"></div>
      <div class="card-arrow">${ARROW_SVG}</div>
      <div class="card-body">
        <div class="card-name">${escapeHtml(city.name)}</div>
        <span class="card-tag">Grupos activos</span>
      </div>
    </a>
  `
        )
        .join('');
}

document.addEventListener('DOMContentLoaded', initCiudadesPage);
