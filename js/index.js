const ARROW_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>`;

const grid    = document.getElementById('countriesGrid');
const entries = Object.entries(COUNTRIES);

// Stats dinámicos calculados desde data.js
const totalCities = entries.reduce((sum, [, c]) => sum + c.cities.length, 0);
document.getElementById('statPaises').textContent   = entries.length;
document.getElementById('statCiudades').textContent = totalCities;
document.getElementById('sectionCount').textContent = `${entries.length} países disponibles`;

// Render grid de países
grid.innerHTML = entries.map(([name, country]) => `
  <a class="country-card" href="ciudades.html?pais=${encodeURIComponent(name)}">
    <img class="card-img" src="${country.cardImg}" alt="${name}" loading="lazy">
    <div class="card-overlay"></div>
    <div class="card-arrow">${ARROW_SVG}</div>
    <div class="card-body">
      <span class="card-flag">${country.flag}</span>
      <div class="card-name">${name}</div>
      <div class="card-meta">${country.cities.length} ciudades</div>
    </div>
  </a>
`).join('');
