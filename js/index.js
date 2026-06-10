// ─────────────────────────────────────────────────────────────
//  INDEX.JS — Erasmus Parties · Home
//  - Autocomplete en search bar (países + ciudades)
//  - Bento grid con rotación aleatoria cada 30s
//  - Link "Ver todas las ciudades" → ciudades-todas.html
// ─────────────────────────────────────────────────────────────

// ── 1. AUTOCOMPLETE ──────────────────────────────────────────

function buildSearchIndex() {
    const items = [];
    for (const [paisName, country] of Object.entries(COUNTRIES)) {
        // País
        items.push({
            type: 'country',
            label: `${country.flag} ${paisName}`,
            name: paisName,
            sub: `${country.cities.length} ciudades`,
            url: `ciudades.html?pais=${encodeURIComponent(paisName)}`,
        });
        // Ciudades
        for (const city of country.cities) {
            items.push({
                type: 'city',
                label: city.name,
                name: city.name,
                sub: paisName,
                flag: country.flag,
                url: `ciudad.html?pais=${encodeURIComponent(paisName)}&ciudad=${encodeURIComponent(city.name)}`,
            });
        }
    }
    return items;
}

function normalize(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function initAutocomplete() {
    const input = document.getElementById('citySearch');
    const searchBar = input && input.closest('.search-bar');
    if (!input || !searchBar) return;

    const index = buildSearchIndex();

    // Crear dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.setAttribute('role', 'listbox');
    searchBar.style.position = 'relative';
    searchBar.appendChild(dropdown);

    let activeIdx = -1;

    function renderDropdown(results) {
        dropdown.innerHTML = '';
        activeIdx = -1;
        if (!results.length) { dropdown.classList.remove('is-open'); return; }

        results.slice(0, 8).forEach((item, i) => {
            const el = document.createElement('a');
            el.className = 'search-dropdown-item';
            el.href = item.url;
            el.setAttribute('role', 'option');
            el.innerHTML = `
        <span class="sdi-icon">${item.type === 'country' ? item.label.split(' ')[0] : item.flag}</span>
        <span class="sdi-text">
          <span class="sdi-name">${item.type === 'country' ? item.name : item.name}</span>
          <span class="sdi-sub">${item.sub}</span>
        </span>
        <span class="sdi-type">${item.type === 'country' ? 'País' : 'Ciudad'}</span>`;
            dropdown.appendChild(el);
        });
        dropdown.classList.add('is-open');
    }

    function setActive(idx) {
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        items.forEach(el => el.classList.remove('is-active'));
        activeIdx = Math.max(-1, Math.min(idx, items.length - 1));
        if (activeIdx >= 0) items[activeIdx].classList.add('is-active');
    }

    input.addEventListener('input', () => {
        const q = input.value.trim();
        if (q.length < 1) { dropdown.classList.remove('is-open'); return; }
        const nq = normalize(q);
        const results = index.filter(item => normalize(item.name).includes(nq));
        // Prioriza: starts with > includes, países > ciudades
        results.sort((a, b) => {
            const an = normalize(a.name),
                bn = normalize(b.name);
            const aStarts = an.startsWith(nq),
                bStarts = bn.startsWith(nq);
            if (aStarts !== bStarts) return aStarts ? -1 : 1;
            if (a.type !== b.type) return a.type === 'country' ? -1 : 1;
            return an.localeCompare(bn);
        });
        renderDropdown(results);
    });

    input.addEventListener('keydown', e => {
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        if (e.key === 'ArrowDown') { e.preventDefault();
            setActive(activeIdx + 1); }
        if (e.key === 'ArrowUp') { e.preventDefault();
            setActive(activeIdx - 1); }
        if (e.key === 'Enter') {
            if (activeIdx >= 0 && items[activeIdx]) {
                e.preventDefault();
                window.location.href = items[activeIdx].href;
            } else {
                doSearch();
            }
        }
        if (e.key === 'Escape') { dropdown.classList.remove('is-open'); }
    });

    document.addEventListener('click', e => {
        if (!searchBar.contains(e.target)) dropdown.classList.remove('is-open');
    });

    // Botón explorar
    const btn = document.querySelector('.search-bar-btn');
    if (btn) btn.addEventListener('click', doSearch);

    function doSearch() {
        const q = input.value.trim();
        if (!q) return;
        const nq = normalize(q);
        const match = index.find(item => normalize(item.name).startsWith(nq));
        if (match) window.location.href = match.url;
        else alert(`No encontramos "${q}". Prueba con otra ciudad o país.`);
    }
}

// ── 2. BENTO GRID ROTATIVO ───────────────────────────────────

// Pool de ciudades destacadas para el bento (las más conocidas con buenas fotos)
const BENTO_POOL = [
    { country: 'España', city: 'Barcelona', desc: 'Vibras playeras y arquitectura gótica.', badge: '+120 ofertas activas', main: true },
    { country: 'Alemania', city: 'Berlín', desc: 'Techno, cultura y vida nocturna sin igual.', badge: null },
    { country: 'Portugal', city: 'Lisboa', desc: 'El punto de encuentro de los nómadas europeos.', badge: null, wide: true },
    { country: 'Francia', city: 'París', desc: null, badge: null },
    { country: 'Italia', city: 'Roma', desc: null, badge: null },
    { country: 'Países Bajos', city: 'Ámsterdam', desc: null, badge: null },
    { country: 'España', city: 'Madrid', desc: null, badge: null },
    { country: 'República Checa', city: 'Praga', desc: 'Historia y fiesta en el corazón de Europa.', badge: null },
    { country: 'Hungría', city: 'Budapest', desc: null, badge: null },
    { country: 'Alemania', city: 'Múnich', desc: null, badge: null },
    { country: 'Italia', city: 'Milán', desc: null, badge: null },
    { country: 'Francia', city: 'Lyon', desc: null, badge: null },
    { country: 'España', city: 'Sevilla', desc: null, badge: null },
    { country: 'Turquía', city: 'Estambul', desc: 'Donde Europa se encuentra con Asia.', badge: null },
    { country: 'Escocia', city: 'Edimburgo', desc: null, badge: null },
    { country: 'Polonia', city: 'Cracovia', desc: null, badge: null },
    { country: 'Grecia', city: 'Atenas', desc: null, badge: null },
    { country: 'Austria', city: 'Viena', desc: null, badge: null },
    { country: 'Portugal', city: 'Oporto', desc: null, badge: null },
    { country: 'Italia', city: 'Florencia', desc: null, badge: null },
    { country: 'Francia', city: 'Marsella', desc: null, badge: null },
    { country: 'España', city: 'Valencia', desc: null, badge: null },
    { country: 'Suecia', city: 'Estocolmo', desc: null, badge: null },
    { country: 'Dinamarca', city: 'Copenhague', desc: null, badge: null },
];

// Plantillas de bento: cada una define qué posición es "main" y cuál "wide"
const BENTO_LAYOUTS = [
    // Layout A: main=0, wide=3
    (pool) => [
        {...pool[0], main: true, wide: false },
        {...pool[1], main: false, wide: false },
        {...pool[2], main: false, wide: false },
        {...pool[3], main: false, wide: true },
    ],
    // Layout B: main=0, wide=2
    (pool) => [
        {...pool[0], main: true, wide: false },
        {...pool[1], main: false, wide: false },
        {...pool[2], main: false, wide: true },
        {...pool[3], main: false, wide: false },
    ],
    // Layout C: main=1, wide=0
    (pool) => [
        {...pool[0], main: false, wide: true },
        {...pool[1], main: true, wide: false },
        {...pool[2], main: false, wide: false },
        {...pool[3], main: false, wide: false },
    ],
];

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function pickBentoSet() {
    const shuffled = shuffle(BENTO_POOL);
    const layout = BENTO_LAYOUTS[Math.floor(Math.random() * BENTO_LAYOUTS.length)];
    return layout(shuffled);
}

function getCityImg(countryName, cityName) {
    const country = COUNTRIES[countryName];
    if (!country) return '';
    const city = country.cities.find(c => c.name === cityName);
    return (city && city.img) || country.cardImg || '';
}

function renderBento(grid, cards, animate = false) {
    if (animate) grid.classList.add('bento-exit');

    setTimeout(() => {
                grid.innerHTML = cards.map(item => {
                            const img = getCityImg(item.country, item.city);
                            const mainCls = item.main ? 'bento-card--main' : '';
                            const wideCls = item.wide ? 'bento-card--wide' : '';
                            const href = `ciudades.html?pais=${encodeURIComponent(item.country)}`;

                            return `
        <a class="bento-card ${mainCls} ${wideCls}" href="${href}">
          <img src="${img}" alt="${item.city}" loading="lazy"/>
          <div class="bento-card-overlay"></div>
          ${item.badge ? `<span class="bento-badge">${item.badge}</span>` : ''}
          <div class="bento-card-body">
            <h3>${item.city}</h3>
            ${item.desc ? `<p>${item.desc}</p>` : ''}
          </div>
        </a>`;
    }).join('');

    grid.classList.remove('bento-exit');
    grid.classList.add('bento-enter');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => grid.classList.remove('bento-enter'));
    });
  }, animate ? 400 : 0);
}

function initBento() {
  const grid = document.getElementById('bentoGrid');
  if (!grid) return;

  // Render inicial
  renderBento(grid, pickBentoSet(), false);

  // Rotación cada 30 segundos
  setInterval(() => {
    renderBento(grid, pickBentoSet(), true);
  }, 30000);
}

// ── 3. STATS ─────────────────────────────────────────────────
function initStats() {
  const entries     = Object.entries(COUNTRIES);
  const totalCities = entries.reduce((sum, [, c]) => sum + c.cities.length, 0);
  const elPaises    = document.getElementById('statPaises');
  const elCiudades  = document.getElementById('statCiudades');
  if (elPaises)   elPaises.textContent   = entries.length;
  if (elCiudades) elCiudades.textContent = `+${totalCities}`;
}

// ── 4. NAV SCROLL SHADOW ─────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('topNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── 5. BOTTOM NAV ────────────────────────────────────────────
function initBottomNav() {
  document.querySelectorAll('.bottom-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('bottom-nav-item--active'));
      item.classList.add('bottom-nav-item--active');
    });
  });
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initStats();
  initBento();
  initNavScroll();
  initBottomNav();
  initAutocomplete();
});