// ─────────────────────────────────────────────────────────────
//  CIUDADES.JS — Erasmus Parties
// ─────────────────────────────────────────────────────────────

const ARROW_SVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>`;

const params   = new URLSearchParams(window.location.search);
const paisName = params.get('pais') || '';
const country  = COUNTRIES[paisName];

if (!country) {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;
                color:var(--on-surface-variant);font-family:'Inter',sans-serif;font-size:15px;">
      País no encontrado.&nbsp;
      <a href="index.html" style="color:var(--primary);">Volver al inicio</a>
    </div>`;
} else {
  document.title = `${paisName} — Erasmus Verified`;

  // Hero
  const heroBg = document.getElementById('heroBg');
  if (heroBg) heroBg.style.backgroundImage = `url('${country.heroImg}')`;

  const heroFlag      = document.getElementById('heroFlag');
  const heroTitle     = document.getElementById('heroTitle');
  const heroCityCount = document.getElementById('heroCityCount');
  const sectionCount  = document.getElementById('sectionCount');

  if (heroFlag)      heroFlag.textContent      = country.flag;
  if (heroTitle)     heroTitle.textContent     = paisName;
  if (heroCityCount) heroCityCount.textContent = `${country.cities.length} ciudades disponibles`;
  if (sectionCount)  sectionCount.textContent  = `${country.cities.length} ciudades`;

  // Grid de ciudades
  const grid  = document.getElementById('citiesGrid');
  const count = country.cities.length;
  if (count <= 3) grid.classList.add('cols-3');
  if (count === 2) grid.classList.add('cols-2');

  grid.innerHTML = country.cities.map(city => `
    <a class="city-card" href="ciudad.html?pais=${encodeURIComponent(paisName)}&ciudad=${encodeURIComponent(city.name)}">
      <img class="card-img" src="${city.img}" alt="${city.name}" loading="lazy"/>
      <div class="card-overlay"></div>
      <div class="card-arrow">${ARROW_SVG}</div>
      <div class="card-body">
        <div class="card-name">${city.name}</div>
        <span class="card-tag">Grupos activos</span>
      </div>
    </a>
  `).join('');
}
