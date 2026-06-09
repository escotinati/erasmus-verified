// ─────────────────────────────────────────────────────────────
//  INDEX.JS — Erasmus Parties · Home
// ─────────────────────────────────────────────────────────────

// ── Bento grid: 4 ciudades destacadas desde COUNTRIES ────────
const BENTO_CITIES = [
  { country: 'España',          city: 'Barcelona', desc: 'Vibras playeras y arquitectura gótica.',             badge: '+120 ofertas activas', main: true },
  { country: 'Reino Unido',     city: 'Londres',   desc: null,                                                badge: null },
  { country: 'Alemania',        city: 'Berlín',    desc: null,                                                badge: null },
  { country: 'Portugal',        city: 'Lisboa',    desc: 'El punto de encuentro de los nómadas digitales europeos.', badge: null, wide: true },
];

// Imágenes curadas para el bento (Unsplash)
const BENTO_IMGS = {
  'Barcelona': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKRfjvJ75YR-NbRrdC4Nf2PvS0qghPp9yM_IPw8Ka3ZjL7Na7hBMCQFWdIAHT49TI6nGkX8P7bAVz9ga-j8AHOZC2Vl1e94rY0yKmb3-4IBrfCASFHnY1sdvrwrKGsFwDAfpC467xRcp0MTO0BxSWttq3FhrRmmAauTPDf1_PEcHmbmObweisOWqIB2FnrxmsY6DJ4k521v0DAIsV6P9lP5iIdeCzwp8CMuvBh_b8136DIVFReEx18rBPXZRhFFHeUfhU1btt7BYnV',
  'Londres':   'https://lh3.googleusercontent.com/aida-public/AB6AXuDk5817A6SLaCzzDCAIY7waiYaF2LRQjpVDr5sqPWHgkIc9BXnNAeVasqsJUVGBAY1HQIsKSCuWbL8f_PUe53Hl9RHB2lp_x1ml07R_74ZLRVO1gd5et9CgSYJypw_6r2Ljh4FEsZy7SB1LSALZUDNF3ScomdFzy6gZy48PdFhCOWs9Ta7e7JunxeJ_qtyEd_UmvvTEnlY_QhLTZDmeUD_Yveu0HaLfl6wnDy1lYWYcZwEcf8s7kJY6nxZlDB6sTOkfAvn8HS7SrYBy',
  'Berlín':    'https://lh3.googleusercontent.com/aida-public/AB6AXuBPBkBAUloYW2skx5IrqV7YGTiQzlKdJUPnX3qlhbKVwXsKFTHqz3IH_iIMUKJA9YTHdLaUADqPr3FJIDQVeuoTa9rQ3Y2_KNp1Sv9CTQfsn5-9NHutK5R3K99gNNeExaZGb-LxDjau8aCBP0nRr_vsNHF1P152P-diEey-3bkQ4fWWBEoCn1GnoTzReuaaMSUrVt0NIkxyTzp8Qn6S7-u_1USWqgoBMcsQjVMBpD2kn4GtvpFVlcqB2XUXNl9wG7DLC2kXggwZtZRK',
  'Lisboa':    'https://lh3.googleusercontent.com/aida-public/AB6AXuAOThmS9_ll_pfwPGEad0QyJOvLQp1HB8mAB0SWHwN3O6jUz5I74f7dnvaW-om0pAj1TGzn8oKp03eBehs0EPlZIiyPR-60rdlS55ewVtH5-z7mPmFBM9gTCD6_Szbcl-jzUdk-V4HW4_DVZqZEzZEZ6QRUOmhI5TPKSi26q4Iy3_YU_Sc7MBj2x4tGzBc4D7glewEQM3YeiGod-1lDAz_5PIT3tmFe1dcl1h9IVKe6PmDwn8aDKDXQHzIgEzSr9FY_MGoc0Lz5fOgO',
};

function renderBento() {
  const grid = document.getElementById('bentoGrid');
  if (!grid) return;

  grid.innerHTML = BENTO_CITIES.map(item => {
    const img      = BENTO_IMGS[item.city] || '';
    const mainCls  = item.main ? 'bento-card--main' : '';
    const wideCls  = item.wide ? 'bento-card--wide' : '';
    const paisParam = encodeURIComponent(item.country);

    // Busca la ciudad en COUNTRIES para obtener la URL real
    const countryData = COUNTRIES[item.country];
    const cityData    = countryData?.cities.find(c => c.name === item.city);
    const href        = `ciudades.html?pais=${paisParam}`;

    return `
      <a class="bento-card ${mainCls} ${wideCls}" href="${href}">
        <img src="${cityData?.img || img}" alt="${item.city}" loading="lazy"/>
        <div class="bento-card-overlay"></div>
        ${item.badge ? `<span class="bento-badge">${item.badge}</span>` : ''}
        <div class="bento-card-body">
          <h3>${item.city}</h3>
          ${item.desc ? `<p>${item.desc}</p>` : ''}
        </div>
      </a>`;
  }).join('');
}

// ── Scroll nav shadow ─────────────────────────────────────────
function initNavScroll() {
  const nav = document.getElementById('topNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// ── Bottom nav active state ───────────────────────────────────
function initBottomNav() {
  const items = document.querySelectorAll('.bottom-nav-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('bottom-nav-item--active'));
      item.classList.add('bottom-nav-item--active');
    });
  });
}

// ── Search bar: filter to ciudades ───────────────────────────
function initSearch() {
  const input = document.getElementById('citySearch');
  const btn   = document.querySelector('.search-bar-btn');
  if (!input || !btn) return;

  function doSearch() {
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    // Busca el país que contiene la ciudad
    for (const [paisName, country] of Object.entries(COUNTRIES)) {
      const found = country.cities.find(c => c.name.toLowerCase().includes(q));
      if (found) {
        window.location.href = `ciudad.html?pais=${encodeURIComponent(paisName)}&ciudad=${encodeURIComponent(found.name)}`;
        return;
      }
      // También busca por país
      if (paisName.toLowerCase().includes(q)) {
        window.location.href = `ciudades.html?pais=${encodeURIComponent(paisName)}`;
        return;
      }
    }
    // Si no encuentra nada, va a ciudades
    alert(`No encontramos "${input.value}". Prueba con otra ciudad.`);
  }

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderBento();
  initNavScroll();
  initBottomNav();
  initSearch();
});
