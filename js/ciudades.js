const ARROW_SVG = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>`;

const params   = new URLSearchParams(window.location.search);
const paisName = params.get('pais') || '';
const country  = COUNTRIES[paisName];

if (!country) {
  document.body.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#777;font-family:Inter,sans-serif;">
      País no encontrado. <a href="index.html" style="color:#ff6b35;margin-left:8px;">Volver</a>
    </div>`;
} else {
  document.title = `${paisName} — Erasmus Groups`;

  document.getElementById('heroBg').style.backgroundImage = `url('${country.heroImg}')`;
  document.getElementById('heroFlag').textContent      = country.flag;
  document.getElementById('heroTitle').textContent     = paisName;
  document.getElementById('heroCityCount').textContent = `${country.cities.length} ciudades disponibles`;
  document.getElementById('sectionCount').textContent  = `${country.cities.length} ciudades`;

  const grid  = document.getElementById('citiesGrid');
  const count = country.cities.length;
  if (count <= 3) grid.classList.add('cols-3');
  if (count === 2) grid.classList.add('cols-2');

  grid.innerHTML = country.cities.map(city => `
    <a class="city-card" href="ciudad.html?pais=${encodeURIComponent(paisName)}&ciudad=${encodeURIComponent(city.name)}">
      <img class="card-img" src="${city.img}" alt="${city.name}" loading="lazy">
      <div class="card-overlay"></div>
      <div class="card-arrow">${ARROW_SVG}</div>
      <div class="card-body">
        <div class="card-name">${city.name}</div>
        <span class="card-tag">✓ Grupos activos</span>
      </div>
    </a>
  `).join('');
}
