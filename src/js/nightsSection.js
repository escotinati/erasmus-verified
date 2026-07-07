// ─────────────────────────────────────────────────────────────
//  NIGHTSSECTION.JS — Erasmus Verified / Erasmus Parties
//
//  Renderiza la nights-section del home con EVENTOS reales
//  (partner_events), no con partners directamente. Un partner es
//  el local físico (fijo); un evento es lo que ese local organiza,
//  con su fecha, hora, precio y temática — ver fetchUpcomingEvents()
//  en services/partnersService.js.
//
//  Transversal a todas las ciudades: no filtra por ciudad, es el
//  "visibilizador" de fiesta del home. RLS ya garantiza en el
//  servidor que solo llegan eventos activos y no vencidos.
// ─────────────────────────────────────────────────────────────

function formatEventDate(isoString) {
    const date = new Date(isoString);
    const dayLabel = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).format(date);
    const timeLabel = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(date);
    const capitalized = dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);
    return `${capitalized} · ${timeLabel}h`;
}

function buildNightCard(event) {
    const cityLabel = event.city ? `${event.city.flag || ''} ${event.city.name}`.trim() : '';
    const venueLabel = event.partner ? event.partner.name : '';
    const locationLabel = [venueLabel, cityLabel].filter(Boolean).join(' — ');

    const card = document.createElement('div');
    card.className = 'event-card';

    card.innerHTML = `
    <div class="event-img-wrap">
      ${
          event.image_url
              ? `<img src="${event.image_url}" alt="${event.title}" loading="lazy" />`
              : `<div class="bento-card-placeholder"></div>`
      }
      <span class="event-badge event-badge--primary"></span>
      ${event.price_label ? '<span class="event-price"></span>' : ''}
    </div>
    <div class="event-body">
      <div class="event-row">
        <div>
          <h4 class="event-name"></h4>
          <p class="event-venue">
            <span class="material-symbols-outlined">location_on</span>
            <span class="event-venue-text"></span>
          </p>
        </div>
      </div>
      <p class="event-date"></p>
      <p class="event-desc"></p>
      <div class="event-footer"></div>
    </div>
  `;

    // textContent para todo dato de BD: mismo criterio anti-XSS que en admin.js
    card.querySelector('.event-badge--primary').textContent = event.theme || 'Fiesta';
    card.querySelector('.event-name').textContent = event.title;
    card.querySelector('.event-venue-text').textContent = locationLabel;
    card.querySelector('.event-date').textContent = formatEventDate(event.starts_at);
    card.querySelector('.event-desc').textContent = event.description || '';

    const priceEl = card.querySelector('.event-price');
    if (priceEl) priceEl.textContent = event.price_label;

    if (event.ticket_url) {
        const btn = document.createElement('a');
        btn.className = 'link-btn';
        btn.href = event.ticket_url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.textContent = 'Ver evento';
        btn.addEventListener('click', () => {
            trackEvent('event_ticket_click', {
                eventId: event.id,
                eventTitle: event.title,
                partnerId: event.partner?.id,
                ticketUrl: event.ticket_url,
            });
        });
        card.querySelector('.event-footer').appendChild(btn);
    }

    return card;
}

// Filtros activos de la barra — se combinan entre sí, cada cambio
// dispara una nueva consulta a Supabase (sin cacheo en cliente).
const currentFilters = { cityId: null, theme: null, dateRange: null, partnerId: null };

function hasActiveFilters() {
    return Boolean(
        currentFilters.cityId || currentFilters.theme || currentFilters.dateRange || currentFilters.partnerId
    );
}

// Extrae ciudades, temas y partners ÚNICOS de los eventos ya cargados
// (fetch inicial sin filtrar) para poblar los <select> — no hace falta
// una query aparte solo para listar opciones. Como este fetch ya pasa
// por RLS (solo eventos activos y no vencidos, de partners activos vía
// el !inner), un partner desactivado o borrado deja de tener eventos
// aquí y por tanto desaparece solo de las opciones del filtro.
function extractFilterOptions(events) {
    const cities = new Map();
    const themes = new Set();
    const partners = new Map();
    events.forEach((event) => {
        if (event.city) cities.set(event.city.id, `${event.city.flag || ''} ${event.city.name}`.trim());
        if (event.theme) themes.add(event.theme);
        if (event.partner) partners.set(event.partner.id, event.partner.name);
    });
    return { cities, themes, partners };
}

// Envuelve un <select> de filtro con su icono (Material Symbols, misma
// fuente que ya usa .event-venue) en un wrapper .nights-filter — el
// icono es puramente decorativo (aria-hidden), el aria-label sigue en
// el propio <select> porque es la única etiqueta accesible que tiene.
function buildFilterSelect(iconName, ariaLabel) {
    const wrap = document.createElement('div');
    wrap.className = 'nights-filter';

    const icon = document.createElement('span');
    icon.className = 'material-symbols-outlined nights-filter__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = iconName;

    const select = document.createElement('select');
    select.className = 'nights-filter-select';
    select.setAttribute('aria-label', ariaLabel);

    wrap.append(icon, select);
    return { wrap, select };
}

function buildFilterBar(cities, themes, partners) {
    const bar = document.createElement('div');
    bar.className = 'nights-filters';

    const { wrap: cityWrap, select: citySelect } = buildFilterSelect('location_on', 'Filtrar por ciudad');
    citySelect.innerHTML = '<option value="">Todas las ciudades</option>';
    for (const [id, label] of cities) {
        const opt = document.createElement('option');
        opt.value = String(id);
        opt.textContent = label;
        citySelect.appendChild(opt);
    }

    const { wrap: themeWrap, select: themeSelect } = buildFilterSelect('local_activity', 'Filtrar por tema');
    themeSelect.innerHTML = '<option value="">Todos los temas</option>';
    for (const theme of themes) {
        const opt = document.createElement('option');
        opt.value = theme;
        opt.textContent = theme;
        themeSelect.appendChild(opt);
    }

    const { wrap: dateWrap, select: dateSelect } = buildFilterSelect('calendar_today', 'Filtrar por fecha');
    dateSelect.innerHTML = `
        <option value="">Cualquier fecha</option>
        <option value="today">Hoy</option>
        <option value="week">Esta semana</option>
        <option value="month">Este mes</option>
    `;

    const { wrap: partnerWrap, select: partnerSelect } = buildFilterSelect('storefront', 'Filtrar por partner');
    partnerSelect.innerHTML = '<option value="">Todos los partners</option>';
    for (const [id, name] of partners) {
        const opt = document.createElement('option');
        opt.value = String(id);
        opt.textContent = name;
        partnerSelect.appendChild(opt);
    }

    const clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'nights-filter-clear';
    clearBtn.textContent = 'Limpiar filtros';
    clearBtn.hidden = !hasActiveFilters();

    // hasActiveFilters() y applyFilters() ya existen — no se toca su
    // lógica, solo se llaman aquí tras cada cambio para reflejar el
    // botón y disparar la nueva consulta, respectivamente.
    function refreshClearButton() {
        clearBtn.hidden = !hasActiveFilters();
    }

    citySelect.addEventListener('change', () => {
        currentFilters.cityId = citySelect.value ? Number(citySelect.value) : null;
        refreshClearButton();
        applyFilters();
    });
    themeSelect.addEventListener('change', () => {
        currentFilters.theme = themeSelect.value || null;
        refreshClearButton();
        applyFilters();
    });
    dateSelect.addEventListener('change', () => {
        currentFilters.dateRange = dateSelect.value || null;
        refreshClearButton();
        applyFilters();
    });
    partnerSelect.addEventListener('change', () => {
        currentFilters.partnerId = partnerSelect.value ? Number(partnerSelect.value) : null;
        refreshClearButton();
        applyFilters();
    });

    clearBtn.addEventListener('click', () => {
        citySelect.value = '';
        themeSelect.value = '';
        dateSelect.value = '';
        partnerSelect.value = '';
        currentFilters.cityId = null;
        currentFilters.theme = null;
        currentFilters.dateRange = null;
        currentFilters.partnerId = null;
        refreshClearButton();
        applyFilters();
    });

    bar.append(cityWrap, themeWrap, dateWrap, partnerWrap, clearBtn);
    return bar;
}

// Pinta las tarjetas (o el estado vacío) a partir de una lista de
// eventos ya obtenida — no hace fetch, solo renderiza. Compartida
// entre la carga inicial y cada cambio de filtro.
function renderEventCards(events) {
    const scroll = document.querySelector('.nights-section .events-scroll');
    if (!scroll) return;

    scroll.innerHTML = '';

    if (events.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'events-loading';
        empty.textContent = hasActiveFilters()
            ? 'No hay fiestas con ese filtro. Prueba otra combinación.'
            : 'Todavía no tenemos fiestas publicadas. Vuelve pronto.';
        scroll.appendChild(empty);
        return;
    }

    // Solo destaca si hay una prioridad editorial real (> 0); en empate
    // a máximo, gana el primero del array (ya viene ordenado por
    // starts_at ascendente desde fetchUpcomingEvents, no es un desempate
    // arbitrario). Se recalcula sobre cada resultado filtrado, no solo
    // sobre la carga inicial.
    const maxPriority = Math.max(...events.map((event) => event.priority || 0));
    const featuredEvent = maxPriority > 0 ? events.find((event) => event.priority === maxPriority) : null;

    events.forEach((event) => {
        const card = buildNightCard(event);
        if (event === featuredEvent) card.classList.add('event-card--featured');
        scroll.appendChild(card);
    });
}

// Vuelve a consultar Supabase con los filtros activos actuales y
// re-renderiza — se llama en cada cambio de cualquier <select>.
async function applyFilters() {
    const events = await fetchUpcomingEvents(currentFilters);
    renderEventCards(events);
}

async function initNightsSection() {
    const scroll = document.querySelector('.nights-section .events-scroll');
    const header = document.querySelector('.nights-section .nights-header');
    if (!scroll || !header) return;

    // Única query inicial, sin filtros: sirve tanto para poblar las
    // opciones de los selects como para el primer render.
    const events = await fetchUpcomingEvents();

    const { cities, themes, partners } = extractFilterOptions(events);
    header.appendChild(buildFilterBar(cities, themes, partners));

    renderEventCards(events);
}

document.addEventListener('DOMContentLoaded', initNightsSection);