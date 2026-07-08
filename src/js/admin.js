let editingPartnerId = null;

// Copia en memoria del último array cargado por cada loadX() — sirve
// de base para el buscador (filtrado en cliente, sin query nueva) y
// para los contadores del dashboard. No sustituye a loadX(): se rellena
// justo después de la consulta que loadX() ya hacía.
let allPartners = [];
let allEvents = [];
let allCities = [];

// Vistas: 'dashboard' (las 3 cards) o el nombre de una sección
// (partners/events/cities). Oculta todo lo demás usando [hidden], el
// mismo patrón que ya usan login-view/panel-view.
function showView(name) {
    document.getElementById('dashboard-view').hidden = name !== 'dashboard';
    document.querySelectorAll('.admin-section[data-section]').forEach((section) => {
        section.hidden = section.dataset.section !== name;
    });
    if (name === 'dashboard') renderDashboardCounts();
}

function renderDashboardCounts() {
    const setCount = (id, list, singular, plural) => {
        const el = document.getElementById(id);
        if (!el) return;
        const activeCount = list.filter((x) => x.active).length;
        const inactiveCount = list.length - activeCount;
        const noun = list.length === 1 ? singular : plural;
        const activeLabel = activeCount === 1 ? 'activo' : 'activos';
        const inactiveLabel = inactiveCount === 1 ? 'inactivo' : 'inactivos';
        el.textContent = `${list.length} ${noun} · ${activeCount} ${activeLabel}, ${inactiveCount} ${inactiveLabel}`;
    };
    setCount('dashboard-partners-count', allPartners, 'partner', 'partners');
    setCount('dashboard-events-count', allEvents, 'evento', 'eventos');
    setCount('dashboard-cities-count', allCities, 'ciudad', 'ciudades');
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
}

function extractCoordsFromGoogleMapsUrl(url) {
    let match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    match = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    return null;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('toggle-password').addEventListener('click', () => {
        const input = document.getElementById('login-password');
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        document.getElementById('icon-eye').style.display = isPassword ? 'block' : 'none';
        document.getElementById('icon-eye-off').style.display = isPassword ? 'none' : 'block';
        document
            .getElementById('toggle-password')
            .setAttribute('aria-label', isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña');
    });
    ['login-email', 'login-password'].forEach((id) => {
        document.getElementById(id).addEventListener('keydown', (e) => {
            if (e.key === 'Enter') login();
        });
    });
    document.getElementById('new-partner-btn').addEventListener('click', () => openModal(null));
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', savePartner);
    document.getElementById('add-link-btn').addEventListener('click', () => addLinkRow());
    document
        .querySelector('#partner-modal .admin-modal__backdrop')
        .addEventListener('click', closeModal);

    document.getElementById('f-maps-extract').addEventListener('click', () => {
        const url = document.getElementById('f-maps-url').value.trim();
        const fb = document.getElementById('f-maps-feedback');
        const coords = extractCoordsFromGoogleMapsUrl(url);
        if (coords) {
            document.getElementById('f-lat').value = coords.lat;
            document.getElementById('f-lng').value = coords.lng;
            fb.textContent = `✓ Coordenadas extraídas: ${coords.lat}, ${coords.lng}`;
            fb.style.color = '#16a34a';
        } else {
            fb.textContent =
                'No se pudieron extraer las coordenadas. ' +
                'Usa la URL completa de la barra del navegador (no enlaces acortados goo.gl).';
            fb.style.color = '#dc2626';
        }
    });

    document.getElementById('cf-maps-extract').addEventListener('click', () => {
        const url = document.getElementById('cf-maps-url').value.trim();
        const fb = document.getElementById('cf-maps-feedback');
        const coords = extractCoordsFromGoogleMapsUrl(url);
        if (coords) {
            document.getElementById('cf-lat').value = coords.lat;
            document.getElementById('cf-lng').value = coords.lng;
            fb.textContent = `✓ Coordenadas extraídas: ${coords.lat}, ${coords.lng}`;
            fb.style.color = '#16a34a';
        } else {
            fb.textContent =
                'No se pudieron extraer las coordenadas. ' +
                'Usa la URL completa de la barra del navegador (no enlaces acortados goo.gl).';
            fb.style.color = '#dc2626';
        }
    });

    document.getElementById('new-city-btn')?.addEventListener('click', () => openCityModal(null));
    document.getElementById('city-modal-close')?.addEventListener('click', closeCityModal);
    document.getElementById('city-modal-cancel')?.addEventListener('click', closeCityModal);
    document.getElementById('city-modal-save')?.addEventListener('click', saveCity);
    document
        .querySelector('#city-modal .admin-modal__backdrop')
        ?.addEventListener('click', closeCityModal);

    document.getElementById('new-event-btn')?.addEventListener('click', () => openEventModal(null));
    document.getElementById('event-modal-close')?.addEventListener('click', closeEventModal);
    document.getElementById('event-modal-cancel')?.addEventListener('click', closeEventModal);
    document.getElementById('event-modal-save')?.addEventListener('click', saveEvent);
    document
        .querySelector('#event-modal .admin-modal__backdrop')
        ?.addEventListener('click', closeEventModal);

    // Dashboard: cards → sección; botón "Volver" → dashboard de nuevo.
    document.querySelectorAll('.admin-dashboard-card').forEach((card) => {
        card.addEventListener('click', () => showView(card.dataset.goto));
    });
    document.querySelectorAll('[data-back]').forEach((btn) => {
        btn.addEventListener('click', () => showView('dashboard'));
    });

    // Buscadores por sección: filtran en cliente sobre los arrays ya
    // cargados (allPartners/allEvents/allCities), sin query nueva a
    // Supabase, y reutilizan las funciones de pintado ya existentes.
    document.getElementById('partners-search')?.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        const filtered = !term
            ? allPartners
            : allPartners.filter((p) =>
                  [p.name, p.category, p.cities?.name].some((field) =>
                      (field || '').toLowerCase().includes(term)
                  )
              );
        renderPartnersTable(filtered);
    });

    document.getElementById('events-search')?.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        const filtered = !term
            ? allEvents
            : allEvents.filter((ev) =>
                  [ev.title, ev.theme, ev.partners?.cities?.name].some((field) =>
                      (field || '').toLowerCase().includes(term)
                  )
              );
        renderEventsTable(filtered);
    });

    document.getElementById('cities-search')?.addEventListener('input', (e) => {
        const term = e.target.value.trim().toLowerCase();
        const filtered = !term
            ? allCities
            : allCities.filter((c) =>
                  [c.name, c.country].some((field) => (field || '').toLowerCase().includes(term))
              );
        renderCitiesTable(filtered);
    });

    window.supabaseClient.auth
        .getSession()
        .then(({ data: { session } }) => {
            session ? showPanel() : showLogin();
        })
        .catch((err) => {
            console.error('[admin] error comprobando sesión:', err);
            showLogin();
        });
});

async function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        errorEl.textContent = error.message || 'Credenciales incorrectas.';
        return;
    }
    showPanel();
}

async function logout() {
    await window.supabaseClient.auth.signOut();
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').textContent = '';
    showLogin();
}

function showLogin() {
    document.getElementById('login-view').hidden = false;
    document.getElementById('panel-view').hidden = true;
}

async function showPanel() {
    document.getElementById('login-view').hidden = true;
    document.getElementById('panel-view').hidden = false;
    await Promise.all([loadPartners(), loadEvents(), loadCities(), loadClicksReport()]);
    showView('dashboard');
}

// ── PARTNERS ──────────────────────────────────────────────────

async function loadPartners() {
    const { data, error } = await window.supabaseClient
        .from('partners')
        .select('*, cities(name)')
        .order('priority', { ascending: false });

    if (error) {
        alert('Error cargando partners: ' + error.message);
        return;
    }
    allPartners = data;
    renderPartnersTable(data);
}

function renderPartnersTable(partners) {
    const wrap = document.getElementById('partners-table');
    const countEl = document.getElementById('partner-count');
    if (countEl)
        countEl.textContent = partners.length + (partners.length === 1 ? ' partner' : ' partners');

    if (partners.length === 0) {
        wrap.innerHTML = '<p class="admin-empty">No hay partners todavía.</p>';
        return;
    }

    const rows = partners
        .map(
            (p) => `
    <tr>
      <td data-label="Nombre">${escapeHtml(p.name)}</td>
      <td data-label="Categoría"><span class="admin-badge admin-badge--${escapeHtml(p.category)}">${escapeHtml(p.category)}</span></td>
      <td data-label="Ciudad">${escapeHtml(p.cities?.name || '—')}</td>
      <td data-label="Prioridad" class="col-num">${p.priority}</td>
      <td data-label="Activo" class="col-center">${p.active ? '✓' : '—'}</td>
      <td class="col-actions">
        <div class="row-actions">
          <button type="button" class="admin-btn admin-btn--sm admin-btn--ghost"
            onclick="openModal(${p.id})">Editar</button>
          <button type="button" class="admin-btn admin-btn--sm ${p.active ? 'admin-btn--danger' : 'admin-btn--success'}"
            onclick="toggleActive(${p.id}, ${p.active})">
            ${p.active ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </td>
    </tr>`
        )
        .join('');

    wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Nombre</th><th>Categoría</th><th>Ciudad</th>
          <th class="col-num">Prioridad</th><th class="col-center">Activo</th><th class="col-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

async function toggleActive(id, currentActive) {
    const { error } = await window.supabaseClient
        .from('partners')
        .update({ active: !currentActive })
        .eq('id', id);
    if (error) {
        alert('Error: ' + error.message);
        return;
    }
    await loadPartners();
}

async function populateCitySelect(selectId, selectedCityId = null) {
    const select = document.getElementById(selectId);
    if (!select) return;

    const cities = await fetchAllCities();
    select.innerHTML = '<option value="">— Selecciona ciudad —</option>';
    for (const city of cities) {
        const opt = document.createElement('option');
        opt.value = city.id;
        opt.textContent = `${city.flag} ${city.name} (${city.country})`;
        if (selectedCityId !== null && city.id === selectedCityId) opt.selected = true;
        select.appendChild(opt);
    }
}

async function openModal(partnerId) {
    editingPartnerId = partnerId || null;
    document.getElementById('modal-title').textContent = partnerId
        ? 'Editar partner'
        : 'Nuevo partner';
    document.getElementById('modal-subtitle').textContent = partnerId
        ? 'Editando los datos del partner'
        : 'Rellena los campos para crear un nuevo partner';

    clearForm();
    await populateCitySelect('f-city-id');

    if (partnerId) {
    const { data: partner } = await window.supabaseClient
        .from('partners')
        .select('*')
        .eq('id', partnerId)
        .single();

    const { data: links } = await window.supabaseClient
        .from('partner_links')
        .select('*')
        .eq('partner_id', partnerId)
        .order('sort_order');

    document.getElementById('f-name').value = partner.name;
    document.getElementById('f-category').value = partner.category;
    document.getElementById('f-description').value = partner.description;
    document.getElementById('f-image').value = partner.image_url || '';
    document.getElementById('f-lat').value = partner.lat || '';
    document.getElementById('f-lng').value = partner.lng || '';
    document.getElementById('f-priority').value = partner.priority;
    document.getElementById('f-active').checked = partner.active;

    const citySelect = document.getElementById('f-city-id');
    if (partner.city_id) citySelect.value = partner.city_id;

    for (const link of links || []) {
        addLinkRow(link);
    }
}

    document.getElementById('partner-modal').hidden = false;
}

function closeModal() {
    document.getElementById('partner-modal').hidden = true;
    clearForm();
}

function clearForm() {
    ['f-name', 'f-description', 'f-image', 'f-lat', 'f-lng', 'f-maps-url'].forEach((id) => {
        document.getElementById(id).value = '';
    });
    document.getElementById('f-maps-feedback').textContent = '';
    document.getElementById('f-category').value = 'nightlife';
    document.getElementById('f-city-id').value = '';
    document.getElementById('f-priority').value = '0';
    document.getElementById('f-active').checked = true;
    document.getElementById('links-container').innerHTML = '';
}

function addLinkRow(link = {}) {
    const container = document.getElementById('links-container');
    const row = document.createElement('div');
    row.className = 'admin-link-row';
    row.innerHTML = `
    <select class="link-type">
      <option value="WEBSITE"       ${link.type === 'WEBSITE' ? 'selected' : ''}>WEBSITE</option>
      <option value="TICKETS"       ${link.type === 'TICKETS' ? 'selected' : ''}>TICKETS</option>
      <option value="OWN_EVENT"     ${link.type === 'OWN_EVENT' ? 'selected' : ''}>OWN_EVENT</option>
      <option value="WHATSAPP_CHAT" ${link.type === 'WHATSAPP_CHAT' ? 'selected' : ''}>WHATSAPP_CHAT</option>
    </select>
    <input class="link-label" type="text" placeholder="Etiqueta" value="${escapeHtml(link.label || '')}" />
    <input class="link-url"   type="text" placeholder="URL"      value="${escapeHtml(link.url || '')}" />
    <button type="button" class="admin-btn admin-btn--sm admin-btn--danger"
      onclick="this.parentElement.remove()">×</button>
  `;
    container.appendChild(row);
}

async function savePartner() {
    const name = document.getElementById('f-name').value.trim();
    const cityId = parseInt(document.getElementById('f-city-id').value, 10);

    if (!name || !cityId) {
        alert('Nombre y ciudad son obligatorios.');
        return;
    }

    const partnerData = {
        name,
        category: document.getElementById('f-category').value,
        city_id: cityId,
        description: document.getElementById('f-description').value.trim(),
        image_url: document.getElementById('f-image').value.trim() || '',
        lat: parseFloat(document.getElementById('f-lat').value) || null,
        lng: parseFloat(document.getElementById('f-lng').value) || null,
        priority: parseInt(document.getElementById('f-priority').value) || 0,
        active: document.getElementById('f-active').checked,
    };

    let savedId = editingPartnerId;
    if (editingPartnerId) {
        const { error } = await window.supabaseClient
            .from('partners')
            .update(partnerData)
            .eq('id', editingPartnerId);
        if (error) {
            alert('Error guardando partner: ' + error.message);
            return;
        }
    } else {
        const { data, error } = await window.supabaseClient
            .from('partners')
            .insert(partnerData)
            .select('id')
            .single();
        if (error) {
            alert('Error guardando partner: ' + error.message);
            return;
        }
        savedId = data.id;
    }

    await window.supabaseClient.from('partner_links').delete().eq('partner_id', savedId);

    const linkRows = document.querySelectorAll('.admin-link-row');
    if (linkRows.length > 0) {
        const links = Array.from(linkRows)
            .map((row, i) => ({
                partner_id: savedId,
                type: row.querySelector('.link-type').value,
                label: row.querySelector('.link-label').value.trim(),
                url: row.querySelector('.link-url').value.trim(),
                sort_order: i,
            }))
            .filter((l) => l.label && l.url);

        if (links.length > 0) {
            const { error: linksError } = await window.supabaseClient
                .from('partner_links')
                .insert(links);
            if (linksError) {
                alert('Error guardando links: ' + linksError.message);
                return;
            }
        }
    }

    closeModal();
    await loadPartners();
}

// ── EVENTOS ───────────────────────────────────────────────────

let editingEventId = null;

// El admin ve TODOS los eventos (activos e inactivos, pasados y
// futuros) — a diferencia de la vista pública, que RLS limita a
// activos y no vencidos.
async function loadEvents() {
    // partners(name, cities(name)): se añadió cities(name) al join que
    // ya existía — antes solo traía el nombre del partner, y el
    // buscador por ciudad (más abajo) necesita la ciudad del partner
    // asociado, que no llegaba con el select original.
    const { data, error } = await window.supabaseClient
        .from('partner_events')
        .select('*, partners(name, cities(name))')
        .order('starts_at', { ascending: false });

    if (error) {
        alert('Error cargando eventos: ' + error.message);
        return;
    }
    allEvents = data;
    renderEventsTable(data);
}

function formatAdminDateTime(isoString) {
    if (!isoString) return '—';
    return new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' }).format(
        new Date(isoString)
    );
}

function renderEventsTable(events) {
    const wrap = document.getElementById('events-table');
    if (!wrap) return;

    const countEl = document.getElementById('events-count');
    if (countEl) countEl.textContent = `(${events.length})`;

    if (events.length === 0) {
        wrap.innerHTML = '<p class="admin-empty">No hay eventos todavía.</p>';
        return;
    }

    const rows = events
        .map(
            (e) => `
    <tr>
      <td data-label="Título">
        <div class="partner-name">${escapeHtml(e.title)}</div>
        <div class="partner-desc">${escapeHtml(e.theme || '—')}</div>
      </td>
      <td data-label="Partner">${escapeHtml(e.partners?.name || '—')}</td>
      <td data-label="Fecha" class="col-num">${formatAdminDateTime(e.starts_at)}</td>
      <td data-label="Precio">${escapeHtml(e.price_label || '—')}</td>
      <td data-label="Prioridad" class="col-num">${e.priority}</td>
      <td data-label="Estado" class="col-center">
        <span class="admin-badge ${e.active ? 'admin-badge--active' : 'admin-badge--inactive'}">
          ${e.active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td class="col-actions" data-label="Acciones">
        <div class="row-actions">
          <button type="button"
            class="admin-btn admin-btn--ghost admin-btn--sm"
            onclick="openEventModal(${e.id})">Editar</button>
          <button type="button"
            class="admin-btn admin-btn--sm ${e.active ? 'admin-btn--danger' : 'admin-btn--success'}"
            onclick="toggleEventActive(${e.id}, ${e.active})">
            ${e.active ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </td>
    </tr>`
        )
        .join('');

    wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Título</th><th>Partner</th><th class="col-num">Fecha</th><th>Precio</th>
          <th class="col-num">Prioridad</th><th class="col-center">Estado</th><th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

async function toggleEventActive(id, current) {
    const { error } = await window.supabaseClient
        .from('partner_events')
        .update({ active: !current })
        .eq('id', id);
    if (error) {
        alert('Error: ' + error.message);
        return;
    }
    await loadEvents();
}

// Solo partners de category='nightlife' — un evento sin un local de
// fiesta detrás no tiene sentido en este modelo de datos.
async function populateEventPartnerSelect(selectedPartnerId = null) {
    const select = document.getElementById('ef-partner-id');
    if (!select) return;

    const { data: partners, error } = await window.supabaseClient
        .from('partners')
        .select('id, name, cities(name)')
        .eq('category', 'nightlife')
        .order('name', { ascending: true });

    if (error) {
        console.error('[admin] error cargando partners nightlife:', error);
        return;
    }

    select.innerHTML = '<option value="">— Selecciona partner —</option>';
    for (const partner of partners || []) {
        const opt = document.createElement('option');
        opt.value = partner.id;
        opt.textContent = partner.cities?.name ? `${partner.name} — ${partner.cities.name}` : partner.name;
        if (selectedPartnerId !== null && partner.id === selectedPartnerId) opt.selected = true;
        select.appendChild(opt);
    }
}

// <input type="datetime-local"> trabaja en hora LOCAL del navegador,
// sin zona horaria — Supabase guarda starts_at como timestamptz (UTC).
// new Date(value) interpreta el string "YYYY-MM-DDTHH:mm" como hora
// local, así que toISOString() ya hace la conversión a UTC correcta.
function localDateTimeToISO(value) {
    if (!value) return null;
    return new Date(value).toISOString();
}

// Camino inverso: de un timestamptz UTC al formato que espera el
// input, ya en hora local (por eso se usa getHours/getMonth, no los
// UTC*, que devolverían la hora tal cual está guardada en UTC).
function isoToLocalDateTimeInput(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

async function openEventModal(eventId) {
    editingEventId = eventId || null;
    document.getElementById('event-modal-title').textContent = eventId
        ? 'Editar evento'
        : 'Nuevo evento';
    document.getElementById('event-modal-subtitle').textContent = eventId
        ? 'Editando el evento #' + eventId
        : 'Rellena los datos del nuevo evento';

    clearEventForm();

    if (eventId) {
        const { data: event } = await window.supabaseClient
            .from('partner_events')
            .select('*')
            .eq('id', eventId)
            .single();

        await populateEventPartnerSelect(event.partner_id);

        document.getElementById('ef-title').value = event.title;
        document.getElementById('ef-theme').value = event.theme || '';
        document.getElementById('ef-description').value = event.description || '';
        document.getElementById('ef-image').value = event.image_url || '';
        document.getElementById('ef-starts-at').value = isoToLocalDateTimeInput(event.starts_at);
        document.getElementById('ef-price-label').value = event.price_label || '';
        document.getElementById('ef-ticket-url').value = event.ticket_url || '';
        document.getElementById('ef-priority').value = event.priority;
        document.getElementById('ef-active').checked = event.active;
    } else {
        await populateEventPartnerSelect();
    }

    document.getElementById('event-modal').hidden = false;
}

function closeEventModal() {
    document.getElementById('event-modal').hidden = true;
    clearEventForm();
}

function clearEventForm() {
    [
        'ef-title',
        'ef-theme',
        'ef-description',
        'ef-image',
        'ef-starts-at',
        'ef-price-label',
        'ef-ticket-url',
    ].forEach((id) => {
        document.getElementById(id).value = '';
    });
    document.getElementById('ef-partner-id').value = '';
    document.getElementById('ef-priority').value = '0';
    document.getElementById('ef-active').checked = true;
    ['ef-title', 'ef-partner-id', 'ef-starts-at'].forEach((id) => setFieldError(id, ''));
}

// Muestra (o limpia, si message es '') un error específico bajo el
// campo indicado — en vez del alert() genérico que había antes.
function setFieldError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);
    if (errorEl) errorEl.textContent = message || '';
    if (inputEl) inputEl.classList.toggle('admin-input--invalid', Boolean(message));
}

async function saveEvent() {
    const title = document.getElementById('ef-title').value.trim();
    const partnerId = parseInt(document.getElementById('ef-partner-id').value, 10);
    const startsAtLocal = document.getElementById('ef-starts-at').value;

    // Se recalcula en cada intento: si el usuario corrige un campo y
    // vuelve a guardar, el mensaje de ESE campo desaparece aunque los
    // otros dos sigan sin rellenar.
    setFieldError('ef-title', title ? '' : 'El título es obligatorio.');
    setFieldError('ef-partner-id', partnerId ? '' : 'Selecciona un partner.');
    setFieldError('ef-starts-at', startsAtLocal ? '' : 'La fecha y hora son obligatorias.');

    if (!title || !partnerId || !startsAtLocal) {
        return;
    }

    const eventData = {
        partner_id: partnerId,
        title,
        description: document.getElementById('ef-description').value.trim(),
        theme: document.getElementById('ef-theme').value.trim(),
        image_url: document.getElementById('ef-image').value.trim() || '',
        starts_at: localDateTimeToISO(startsAtLocal),
        price_label: document.getElementById('ef-price-label').value.trim(),
        ticket_url: document.getElementById('ef-ticket-url').value.trim(),
        priority: parseInt(document.getElementById('ef-priority').value) || 0,
        active: document.getElementById('ef-active').checked,
    };

    if (editingEventId) {
        const { error } = await window.supabaseClient
            .from('partner_events')
            .update(eventData)
            .eq('id', editingEventId);
        if (error) {
            alert('Error guardando evento: ' + error.message);
            return;
        }
    } else {
        const { error } = await window.supabaseClient.from('partner_events').insert(eventData);
        if (error) {
            alert('Error guardando evento: ' + error.message);
            return;
        }
    }

    closeEventModal();
    await loadEvents();
}

// ── CIUDADES ──────────────────────────────────────────────────

let editingCityId = null;

async function loadCities() {
    const { data, error } = await window.supabaseClient
        .from('cities')
        .select('*')
        .order('priority', { ascending: false });

    if (error) {
        alert('Error cargando ciudades: ' + error.message);
        return;
    }
    allCities = data;
    renderCitiesTable(data);
}

function renderCitiesTable(cities) {
    const wrap = document.getElementById('cities-table');
    if (!wrap) return;

    const countEl = document.getElementById('cities-count');
    if (countEl) countEl.textContent = `(${cities.length})`;

    if (cities.length === 0) {
        wrap.innerHTML = '<p class="admin-empty">No hay ciudades todavía.</p>';
        return;
    }

    const rows = cities
        .map(
            (c) => `
    <tr>
      <td data-label="Ciudad">
        <div class="partner-name">${escapeHtml(c.flag)} ${escapeHtml(c.name)}</div>
        <div class="partner-desc">${escapeHtml(c.country)}</div>
      </td>
      <td data-label="WhatsApp" class="col-center">
        ${c.whatsapp_url ? '<span class="admin-badge admin-badge--active">✓ Configurado</span>' : '<span class="admin-badge admin-badge--inactive">Sin URL</span>'}
      </td>
      <td data-label="Prioridad" class="col-num">${c.priority}</td>
      <td data-label="Estado" class="col-center">
        <span class="admin-badge ${c.active ? 'admin-badge--active' : 'admin-badge--inactive'}">
          ${c.active ? 'Activa' : 'Inactiva'}
        </span>
      </td>
      <td class="col-actions" data-label="Acciones">
        <div class="row-actions">
          <button type="button"
            class="admin-btn admin-btn--ghost admin-btn--sm"
            onclick="openCityModal(${c.id})">Editar</button>
          <button type="button"
            class="admin-btn admin-btn--sm ${c.active ? 'admin-btn--danger' : 'admin-btn--success'}"
            onclick="toggleCityActive(${c.id}, ${c.active})">
            ${c.active ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </td>
    </tr>`
        )
        .join('');

    wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Ciudad</th>
          <th class="col-center">WhatsApp</th>
          <th class="col-num">Prioridad</th>
          <th class="col-center">Estado</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

async function toggleCityActive(id, current) {
    const { error } = await window.supabaseClient
        .from('cities')
        .update({ active: !current })
        .eq('id', id);
    if (error) {
        alert('Error: ' + error.message);
        return;
    }
    await loadCities();
}

async function openCityModal(cityId) {
    editingCityId = cityId || null;
    document.getElementById('city-modal-title').textContent = cityId
        ? 'Editar ciudad'
        : 'Nueva ciudad';
    document.getElementById('city-modal-subtitle').textContent = cityId
        ? 'Editando ciudad #' + cityId
        : 'Rellena los datos de la nueva ciudad';

    clearCityForm();

    if (cityId) {
        const { data: city } = await window.supabaseClient
            .from('cities')
            .select('*')
            .eq('id', cityId)
            .single();

        document.getElementById('cf-name').value = city.name;
        document.getElementById('cf-country').value = city.country;
        document.getElementById('cf-flag').value = city.flag;
        document.getElementById('cf-description').value = city.description || '';
        document.getElementById('cf-image').value = city.image_url || '';
        document.getElementById('cf-lat').value = city.lat || '';
        document.getElementById('cf-lng').value = city.lng || '';
        document.getElementById('cf-whatsapp-url').value = city.whatsapp_url || '';
        document.getElementById('cf-priority').value = city.priority;
        document.getElementById('cf-active').checked = city.active;
    }

    document.getElementById('city-modal').hidden = false;
}

function closeCityModal() {
    document.getElementById('city-modal').hidden = true;
    clearCityForm();
}

function clearCityForm() {
    [
        'cf-name',
        'cf-country',
        'cf-flag',
        'cf-description',
        'cf-image',
        'cf-lat',
        'cf-lng',
        'cf-whatsapp-url',
        'cf-maps-url',
    ].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('cf-maps-feedback').textContent = '';
    document.getElementById('cf-priority').value = '0';
    document.getElementById('cf-active').checked = false;
}

async function saveCity() {
    const name = document.getElementById('cf-name').value.trim();
    const country = document.getElementById('cf-country').value.trim();
    const whatsappUrl = document.getElementById('cf-whatsapp-url').value.trim();

    if (!name || !country) {
        alert('Nombre y país son obligatorios.');
        return;
    }
    if (!whatsappUrl) {
        alert('El grupo de WhatsApp es obligatorio.');
        return;
    }

    const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const cityData = {
        name,
        country,
        slug,
        flag: document.getElementById('cf-flag').value.trim(),
        description: document.getElementById('cf-description').value.trim(),
        image_url: document.getElementById('cf-image').value.trim(),
        lat: parseFloat(document.getElementById('cf-lat').value) || null,
        lng: parseFloat(document.getElementById('cf-lng').value) || null,
        whatsapp_url: whatsappUrl,
        priority: parseInt(document.getElementById('cf-priority').value) || 0,
        active: document.getElementById('cf-active').checked,
    };

    if (editingCityId) {
        const { error } = await window.supabaseClient
            .from('cities')
            .update(cityData)
            .eq('id', editingCityId);
        if (error) {
            alert('Error guardando ciudad: ' + error.message);
            return;
        }
    } else {
        const { error } = await window.supabaseClient.from('cities').insert(cityData);
        if (error) {
            alert('Error guardando ciudad: ' + error.message);
            return;
        }
    }

    closeCityModal();
    await loadCities();
}

// ── CLICKS REPORT ─────────────────────────────────────────────

async function loadClicksReport() {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const { data, error } = await window.supabaseClient
        .from('cta_clicks')
        .select('partner_id, partners(name)')
        .gte('created_at', since);

    if (error) {
        document.getElementById('clicks-report').innerHTML =
            '<p class="admin-empty">Error cargando métricas.</p>';
        return;
    }

    if (!data || data.length === 0) {
        document.getElementById('clicks-report').innerHTML =
            '<p class="admin-empty">Sin clics registrados todavía.</p>';
        return;
    }

    const counts = {};
    for (const row of data) {
        const name = row.partners?.name || String(row.partner_id);
        counts[name] = (counts[name] || 0) + 1;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const rows = sorted
        .map(
            ([name, count]) => `
    <div class="admin-metric-card">
      <div class="admin-metric-card__count">${count}</div>
      <div class="admin-metric-card__name">${escapeHtml(name)}</div>
      <div class="admin-metric-card__label">clics</div>
    </div>`
        )
        .join('');

    document.getElementById('clicks-report').innerHTML = rows;
}