// ─────────────────────────────────────────────────────────────
//  INDEX.JS — Erasmus Verified · Home
//  - Autocomplete en search bar (ciudades desde Supabase)
//  - Bento grid con rotación aleatoria cada 30s
// ─────────────────────────────────────────────────────────────

// ── 1. AUTOCOMPLETE ──────────────────────────────────────────

async function buildSearchIndex() {
    const cities = await fetchActiveCities();
    return cities.map((city) => ({
        type: 'city',
        label: city.name,
        name: city.name,
        sub: city.country,
        flag: city.flag,
        url: `ciudad.html?ciudad=${encodeURIComponent(city.id)}`,
    }));
}

function normalize(str) {
    return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

async function initAutocomplete() {
    const input = document.getElementById('citySearch');
    const searchBar = input && input.closest('.search-bar');
    if (!input || !searchBar) return;

    const index = await buildSearchIndex();

    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.setAttribute('role', 'listbox');
    searchBar.style.position = 'relative';
    searchBar.appendChild(dropdown);

    let activeIdx = -1;

    function renderDropdown(results) {
        dropdown.innerHTML = '';
        activeIdx = -1;
        if (!results.length) {
            dropdown.classList.remove('is-open');
            return;
        }

        results.slice(0, 8).forEach((item) => {
            const el = document.createElement('a');
            el.className = 'search-dropdown-item';
            el.href = item.url;
            el.setAttribute('role', 'option');
            el.innerHTML = `
        <span class="sdi-icon">${item.flag || ''}</span>
        <span class="sdi-text">
          <span class="sdi-name">${item.name}</span>
          <span class="sdi-sub">${item.sub}</span>
        </span>
        <span class="sdi-type">${I18n.t('home.search_result_type_city')}</span>`;
            dropdown.appendChild(el);
        });
        dropdown.classList.add('is-open');
    }

    function setActive(idx) {
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        items.forEach((el) => el.classList.remove('is-active'));
        activeIdx = Math.max(-1, Math.min(idx, items.length - 1));
        if (activeIdx >= 0) items[activeIdx].classList.add('is-active');
    }

    input.addEventListener('input', () => {
        const q = input.value.trim();
        if (q.length < 1) {
            dropdown.classList.remove('is-open');
            return;
        }
        const nq = normalize(q);
        const results = index.filter((item) => normalize(item.name).includes(nq));
        results.sort((a, b) => {
            const an = normalize(a.name),
                bn = normalize(b.name);
            const aStarts = an.startsWith(nq),
                bStarts = bn.startsWith(nq);
            if (aStarts !== bStarts) return aStarts ? -1 : 1;
            return an.localeCompare(bn);
        });
        renderDropdown(results);
    });

    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(activeIdx + 1);
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(activeIdx - 1);
        }
        if (e.key === 'Enter') {
            if (activeIdx >= 0 && items[activeIdx]) {
                e.preventDefault();
                window.location.href = items[activeIdx].href;
            } else {
                doSearch();
            }
        }
        if (e.key === 'Escape') {
            dropdown.classList.remove('is-open');
        }
    });

    document.addEventListener('click', (e) => {
        if (!searchBar.contains(e.target)) dropdown.classList.remove('is-open');
    });

    const btn = document.querySelector('.search-bar-btn');
    if (btn) btn.addEventListener('click', doSearch);

    function doSearch() {
        const q = input.value.trim();
        if (!q) return;
        const nq = normalize(q);
        const match = index.find((item) => normalize(item.name).startsWith(nq));
        if (match) window.location.href = match.url;
        else
            alert(
                `${I18n.t('home.search_not_found_prefix')} "${q}". ${I18n.t('home.search_not_found_suffix')}`
            );
    }
}

// ── 2. BENTO GRID ROTATIVO ───────────────────────────────────

const BENTO_LAYOUTS = [
    // Layout A: main=0, wide=3
    (pool) => [
        { ...pool[0], main: true, wide: false },
        { ...pool[1], main: false, wide: false },
        { ...pool[2], main: false, wide: false },
        { ...pool[3], main: false, wide: true },
    ],
    // Layout B: main=0, wide=2
    (pool) => [
        { ...pool[0], main: true, wide: false },
        { ...pool[1], main: false, wide: false },
        { ...pool[2], main: false, wide: true },
        { ...pool[3], main: false, wide: false },
    ],
    // Layout C: main=1, wide=0
    (pool) => [
        { ...pool[0], main: false, wide: true },
        { ...pool[1], main: true, wide: false },
        { ...pool[2], main: false, wide: false },
        { ...pool[3], main: false, wide: false },
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

function pickBentoSet(cities) {
    const shuffled = shuffle(cities);
    const pool = shuffled.slice(0, 4);
    const layout = BENTO_LAYOUTS[Math.floor(Math.random() * BENTO_LAYOUTS.length)];
    return layout(pool);
}

function renderBento(grid, cards, animate = false) {
    if (animate) grid.classList.add('bento-exit');

    setTimeout(
        () => {
            grid.innerHTML = cards
                .map((item, i) => {
                    const mainCls = item.main ? 'bento-card--main' : '';
                    const wideCls = item.wide ? 'bento-card--wide' : '';
                    const href = `ciudad.html?ciudad=${encodeURIComponent(item.id)}`;
                    const delayCls = `anim-delay-${(i % 8) + 1}`;

                    return `
        <a class="bento-card ${mainCls} ${wideCls} anim-fade-up card-hoverable ${delayCls}" href="${href}">
          ${
              item.image_url
                  ? `<img src="${item.image_url}" alt="${item.name}" loading="lazy"/>`
                  : `<div class="bento-card-placeholder"></div>`
          }
          <div class="bento-card-overlay"></div>
          <div class="bento-card-body">
            <h3>${item.flag} ${item.name}</h3>
            ${I18n.tField(item.description) ? `<p>${I18n.tField(item.description)}</p>` : ''}
          </div>
        </a>`;
                })
                .join('');

            grid.classList.remove('bento-exit');
            grid.classList.add('bento-enter');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => grid.classList.remove('bento-enter'));
            });

            // Las cards se regeneran por completo en cada rotación (cada 30s)
            // y en la carga inicial — hay que volver a observarlas cada vez,
            // si no las nuevas quedarían con opacity:0 para siempre.
            if (window.initScrollReveal) window.initScrollReveal();
        },
        animate ? 400 : 0
    );
}

async function initBento(cities) {
    const grid = document.getElementById('bentoGrid');
    if (!grid) return;

    grid.innerHTML = `<p style="color:var(--text-muted);padding:40px;text-align:center">${I18n.t('home.loading_cities')}</p>`;

    if (cities.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted);padding:40px;text-align:center">${I18n.t('home.more_cities_coming_soon')}</p>`;
        return;
    }

    // Si hay menos de 4 ciudades, repetir para completar el layout
    let pool = cities;
    while (pool.length < 4) {
        pool = [...pool, ...cities];
    }

    renderBento(grid, pickBentoSet(pool), false);

    if (cities.length > 4) {
        setInterval(() => {
            renderBento(grid, pickBentoSet(pool), true);
        }, 30000);
    }
}

// ── 3. STATS ─────────────────────────────────────────────────
function initStats(cities) {
    const countries = [...new Set(cities.map((c) => c.country))];

    const elPaises = document.getElementById('statPaises');
    const elCiudades = document.getElementById('statCiudades');
    if (elPaises) elPaises.textContent = countries.length;
    if (elCiudades) elCiudades.textContent = cities.length;
}

// ── 4. NAV SCROLL SHADOW ─────────────────────────────────────
function initNavScroll() {
    const nav = document.getElementById('topNav');
    if (!nav) return;
    window.addEventListener(
        'scroll',
        () => {
            nav.classList.toggle('scrolled', window.scrollY > 20);
        },
        { passive: true }
    );
}

// ── 5. BOTTOM NAV ────────────────────────────────────────────
function initBottomNav() {
    document.querySelectorAll('.bottom-nav-item').forEach((item) => {
        item.addEventListener('click', () => {
            document
                .querySelectorAll('.bottom-nav-item')
                .forEach((i) => i.classList.remove('bottom-nav-item--active'));
            item.classList.add('bottom-nav-item--active');
        });
    });
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    const cities = await fetchActiveCities();
    await Promise.all([initStats(cities), initBento(cities)]);
    initNavScroll();
    initBottomNav();
    await initAutocomplete();
});
