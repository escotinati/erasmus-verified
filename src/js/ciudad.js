// ─────────────────────────────────────────────────────────────
//  CIUDAD.JS — Erasmus Parties
// ─────────────────────────────────────────────────────────────

const params = new URLSearchParams(window.location.search);
const pais = params.get('pais') || '';
const ciudad = params.get('ciudad') || '';
const country = COUNTRIES[pais];

if (!pais || !ciudad || !country) {
    document.getElementById('cityPage').innerHTML = `
    <div style="text-align:center;padding:60px 20px;color:var(--on-surface-variant);">
      <span style="font-size:2.5rem;display:block;margin-bottom:16px;">😵</span>
      <h2 style="font-size:1.2rem;font-family:'Syne',sans-serif;color:var(--on-surface);margin-bottom:8px;">Ciudad no encontrada</h2>
      <p>Vuelve al inicio y selecciona tu destino.</p>
      <a href="index.html" style="display:inline-block;margin-top:20px;color:var(--primary);">← Inicio</a>
    </div>`;
} else {
    const cityLinks = LINKS[ciudad] || {};
    const hasWa = !!cityLinks.wa;
    const hasTg = !!cityLinks.tg;
    const hasGeneric = !!cityLinks.generic;

    document.title = `${ciudad}, ${pais} — Erasmus Verified`;

    // Navegación
    document.getElementById('breadcrumbPais').textContent = pais;
    document.getElementById('breadcrumbPaisLink').href =
        `ciudades.html?pais=${encodeURIComponent(pais)}`;
    document.getElementById('breadcrumbCiudad').textContent = ciudad;
    document.getElementById('backLink').href = `ciudades.html?pais=${encodeURIComponent(pais)}`;
    document.getElementById('backLinkText').textContent = pais;
    document.getElementById('footerBack').href = `ciudades.html?pais=${encodeURIComponent(pais)}`;

    // Cabecera
    document.getElementById('cityFlag').textContent = country.flag;
    document.getElementById('cityLocation').textContent = `${pais} · Erasmus`;
    document.getElementById('cityName').textContent = ciudad;

    // ── Bloque del mapa: SIEMPRE visible, va primero en .actions ──
    let btns = buildMapBlock(pais, ciudad);

    // "Unirse a los grupos" ahora va DEBAJO del mapa, justo encima
    // de los botones de grupos / .coming-soon.
    btns += `<div class="section-divider"><span>Unirse a los grupos</span></div>`;

    // Botones de grupos (lógica original sin cambios)
    if (hasWa) btns += buildBtn('wa', cityLinks.wa, ciudad);
    if (hasTg) btns += buildBtn('tg', cityLinks.tg, ciudad);
    if (hasGeneric) btns += buildBtn('generic', cityLinks.generic, ciudad);
    if (!hasWa && !hasTg && !hasGeneric) {
        btns += `
      <div class="coming-soon">
        <span class="emoji">⏳</span>
        <h3>Grupos próximamente</h3>
        <p>Todavía no tenemos grupos para ${ciudad}. Vuelve pronto.</p>
        <div style="margin-top: 20px;">
          <button class="action-btn btn-wa" disabled>
            ${iconWa()}
            <div class="btn-label">
              <strong>Unirse al grupo de WhatsApp</strong>
              <span>${ciudad} · Erasmus Parties</span>
            </div>
            <svg class="btn-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>
      </div>`;
    }

    document.getElementById('actionsWrap').innerHTML = btns;

    // Secciones contextuales (alojamiento + viajes si hay partners)
    buildContextualSections(ciudad);

    // Publica la altura real del topbar como variable CSS para que el
    // mapa sticky en móvil sepa exactamente dónde "anclarse" sin
    // solaparse con el header.
    const topbarEl = document.querySelector('header.topbar');
    const setTopbarH = () => {
        document.documentElement.style.setProperty('--topbar-h', topbarEl.offsetHeight + 'px');
    };
    setTopbarH();
    window.addEventListener('resize', setTopbarH);

    // El mapa se monta DESPUÉS de insertar el HTML, porque mountCityMap
    // necesita que #city-map-embed exista ya en el DOM.
    //
    // interactive: true — en móvil el mapa es sticky (el scroll de la
    // página pasa POR DEBAJO del mapa, no a través de él), así que no
    // existe conflicto de gestos que justifique el overlay "toca para
    // interactuar". En escritorio el layout de dos columnas tampoco lo
    // necesita.
    mountCityMap('city-map-embed', { pais, ciudad, interactive: true }).then(
        async (mapInstance) => {
            if (mapInstance) {
                await mountPartnersList(
                    'city-partners-list',
                    mapInstance,
                    ciudad,
                    window.ERASMUS_EXPERIENCE.defaultCategory
                );
                const mapEl = document.getElementById('city-map-embed');
                const asideEl = document.getElementById('city-partners-list');
                const syncHeight = () => {
                    if (window.innerWidth >= 900) {
                        asideEl.style.height = mapEl.offsetHeight + 'px';
                    } else {
                        asideEl.style.height = '';
                    }
                    // Leaflet no detecta cambios de tamaño del contenedor
                    // automáticamente; necesario al cambiar de breakpoint
                    // (ej. 220px sticky → aspect-ratio escritorio).
                    mapInstance.invalidateSize();
                };
                syncHeight();
                new ResizeObserver(syncHeight).observe(mapEl);
            }
        }
    );
}

function buildContextualSections(ciudad) {
    const travelPartners = getPartnersByCity(ciudad).filter((p) => p.category === 'travel');
    let html = '';

    // Sección A — Alojamiento: siempre visible
    html += `
    <div class="info-box" style="margin-top:24px">
      <span class="info-icon material-symbols-outlined">apartment</span>
      <div>
        <p class="info-text" style="margin-bottom:12px">
          <strong>Encuentra piso en ${ciudad}</strong><br>
          Accede a nuestros colaboradores verificados para encontrar tu alojamiento antes de llegar.
        </p>
        <a href="alojamiento.html" class="btn-primary-pill" style="display:inline-flex">Ver colaboradores →</a>
      </div>
    </div>`;

    // Sección B — Viajes: solo si hay partners de travel en esta ciudad
    if (travelPartners.length > 0) {
        const cards = travelPartners
            .map(
                (p) => `
        <div class="service-card">
          <div class="service-icon"><span class="material-symbols-outlined">flight</span></div>
          <h3 class="service-name">${p.name}</h3>
          <p class="service-desc">${p.description}</p>
          ${
              p.links.length > 0
                  ? `<a href="${p.links[0].url}" target="_blank" rel="noopener noreferrer" class="btn-primary-pill">Ver viaje</a>`
                  : ''
          }
        </div>`
            )
            .join('');

        html += `
    <div style="margin-top:32px">
      <span class="eyebrow eyebrow--primary">VIAJES</span>
      <h2 class="section-title" style="font-size:1.1rem;margin-bottom:8px">Escapadas desde ${ciudad}</h2>
      <div class="services-grid" style="margin-top:16px">${cards}</div>
    </div>`;
    }

    const extra = document.getElementById('city-extra');
    if (extra) extra.innerHTML = html;
}

function buildBtn(type, url, city) {
    const cls = type === 'wa' ? 'btn-wa' : type === 'tg' ? 'btn-tg' : 'btn-generic';
    const label =
        type === 'wa'
            ? 'Unirse al grupo de WhatsApp'
            : type === 'tg'
              ? 'Unirse al canal de Telegram'
              : 'Unirse a la comunidad';
    const icon = type === 'wa' ? iconWa() : type === 'tg' ? iconTg() : iconGeneric();
    return `
    <a href="${url}" target="_blank" rel="noopener noreferrer" class="action-btn ${cls}">
      ${icon}
      <div class="btn-label">
        <strong>${label}</strong>
        <span>${city} · Erasmus Parties</span>
      </div>
      <svg class="btn-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
    </a>`;
}

/**
 * Bloque "Mapa de {ciudad}": contenedor embebido + enlace a pantalla
 * completa (mapa.html). El mapa se monta después de insertar este
 * HTML en el DOM (mountCityMap necesita que #city-map-embed ya exista).
 */
function buildMapBlock(pais, ciudad) {
    const fullscreenUrl = `mapa.html?pais=${encodeURIComponent(pais)}&ciudad=${encodeURIComponent(ciudad)}`;
    return `
    <div class="city-map-block">
      <div class="city-map-columns">
        <div id="city-map-embed" class="city-map-embed" aria-label="Mapa de ${ciudad}"></div>
        <aside id="city-partners-list" class="partners-list"></aside>
      </div>
      <a href="${fullscreenUrl}" class="city-map-fullscreen-link">
        Ver mapa a pantalla completa
      </a>
    </div>`;
}

function iconWa() {
    return `<svg class="btn-icon" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>`;
}

function iconTg() {
    return `<svg class="btn-icon" viewBox="0 0 24 24">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>`;
}

function iconGeneric() {
    return `<svg class="btn-icon" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`;
}

/**
 * Icono de pin de mapa para el botón "Ver mapa de {ciudad}".
 * Usa stroke (no fill) en --primary, igual que iconGeneric en btn-generic.
 */
function iconMap() {
    return `<svg class="btn-icon" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>`;
}
