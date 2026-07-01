let editingPartnerId = null;

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
    await Promise.all([loadPartners(), loadCities(), loadClicksReport()]);
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
      <td data-label="Nombre">${p.name}</td>
      <td data-label="Categoría"><span class="admin-badge admin-badge--${p.category}">${p.category}</span></td>
      <td data-label="Ciudad">${p.cities?.name || '—'}</td>
      <td data-label="Prioridad">${p.priority}</td>
      <td data-label="Activo">${p.active ? '✓' : '—'}</td>
      <td>
        <button type="button" class="admin-btn admin-btn--sm admin-btn--ghost"
          onclick="openModal(${p.id})">Editar</button>
        <button type="button" class="admin-btn admin-btn--sm ${p.active ? 'admin-btn--danger' : 'admin-btn--success'}"
          onclick="toggleActive(${p.id}, ${p.active})">
          ${p.active ? 'Desactivar' : 'Activar'}
        </button>
      </td>
    </tr>`
        )
        .join('');

    wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Nombre</th><th>Categoría</th><th>Ciudad</th>
          <th>Prioridad</th><th>Activo</th><th>Acciones</th>
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
    <input class="link-label" type="text" placeholder="Etiqueta" value="${link.label || ''}" />
    <input class="link-url"   type="text" placeholder="URL"      value="${link.url || ''}" />
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
        <div class="partner-name">${c.flag} ${c.name}</div>
        <div class="partner-desc">${c.country}</div>
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
      <div class="admin-metric-card__name">${name}</div>
      <div class="admin-metric-card__label">clics</div>
    </div>`
        )
        .join('');

    document.getElementById('clicks-report').innerHTML = rows;
}
