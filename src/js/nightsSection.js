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

async function initNightsSection() {
    const scroll = document.querySelector('.nights-section .events-scroll');
    if (!scroll) return;

    const events = await fetchUpcomingEvents();

    scroll.innerHTML = '';

    if (events.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'events-loading';
        empty.textContent = 'Todavía no tenemos fiestas publicadas. Vuelve pronto.';
        scroll.appendChild(empty);
        return;
    }

    // Solo destaca si hay una prioridad editorial real (> 0); en empate
    // a máximo, gana el primero del array (ya viene ordenado por
    // starts_at ascendente desde fetchUpcomingEvents, no es un desempate
    // arbitrario).
    const maxPriority = Math.max(...events.map((event) => event.priority || 0));
    const featuredEvent = maxPriority > 0 ? events.find((event) => event.priority === maxPriority) : null;

    events.forEach((event) => {
        const card = buildNightCard(event);
        if (event === featuredEvent) card.classList.add('event-card--featured');
        scroll.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', initNightsSection);