let editingPartnerId = null;

document.addEventListener('DOMContentLoaded', function () {
    // Listeners primero — no dependen de que getSession resuelva
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('new-partner-btn').addEventListener('click', () => openModal(null));
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', savePartner);
    document.getElementById('add-link-btn').addEventListener('click', () => addLinkRow());
    document
        .querySelector('#partner-modal .admin-modal__backdrop')
        .addEventListener('click', closeModal);

    document.getElementById('new-city-btn')?.addEventListener('click', () => openCityModal(null));
    document.getElementById('city-modal-close')?.addEventListener('click', closeCityModal);
    document.getElementById('city-modal-cancel')?.addEventListener('click', closeCityModal);
    document.getElementById('city-modal-save')?.addEventListener('click', saveCity);
    document.getElementById('add-group-btn')?.addEventListener('click', () => addGroupRow());
    document
        .querySelector('#city-modal .admin-modal__backdrop')
        ?.addEventListener('click', closeCityModal);

    // Verificar sesión existente después
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

async function loadPartners() {
    const { data, error } = await window.supabaseClient
        .from('partners')
        .select('*')
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
      <td data-label="Ciudad">${p.ciudad}</td>
      <td data-label="Prioridad">${p.priority}</td>
      <td data-label="Activo">${p.active ? '✓' : '—'}</td>
      <td>
        <button type="button" class="admin-btn admin-btn--sm admin-btn--ghost"
          onclick="openModal('${p.id}')">Editar</button>
        <button type="button" class="admin-btn admin-btn--sm admin-btn--danger"
          onclick="toggleActive('${p.id}', ${p.active})">
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

async function openModal(partnerId) {
    editingPartnerId = partnerId;
    document.getElementById('modal-title').textContent = partnerId
        ? 'Editar partner'
        : 'Nuevo partner';
    document.getElementById('modal-subtitle').textContent = partnerId
        ? 'Editando los datos del partner'
        : 'Rellena los campos para crear un nuevo partner';
    document.getElementById('f-id').disabled = !!partnerId;

    clearForm();

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

        document.getElementById('f-id').value = partner.id;
        document.getElementById('f-name').value = partner.name;
        document.getElementById('f-category').value = partner.category;
        document.getElementById('f-pais').value = partner.pais;
        document.getElementById('f-ciudad').value = partner.ciudad;
        document.getElementById('f-description').value = partner.description;
        document.getElementById('f-lat').value = partner.lat || '';
        document.getElementById('f-lng').value = partner.lng || '';
        document.getElementById('f-priority').value = partner.priority;
        document.getElementById('f-active').checked = partner.active;

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
    ['f-id', 'f-name', 'f-pais', 'f-ciudad', 'f-description', 'f-lat', 'f-lng'].forEach((id) => {
        document.getElementById(id).value = '';
    });
    document.getElementById('f-category').value = 'nightlife';
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
    const id = document.getElementById('f-id').value.trim();
    const name = document.getElementById('f-name').value.trim();
    const category = document.getElementById('f-category').value;
    const pais = document.getElementById('f-pais').value.trim();
    const ciudad = document.getElementById('f-ciudad').value.trim();

    if (!id || !name || !pais || !ciudad) {
        alert('ID, nombre, país y ciudad son obligatorios.');
        return;
    }

    const partnerData = {
        id,
        name,
        category,
        pais,
        ciudad,
        description: document.getElementById('f-description').value.trim(),
        lat: parseFloat(document.getElementById('f-lat').value) || null,
        lng: parseFloat(document.getElementById('f-lng').value) || null,
        priority: parseInt(document.getElementById('f-priority').value) || 0,
        active: document.getElementById('f-active').checked,
    };

    const { error: partnerError } = await window.supabaseClient
        .from('partners')
        .upsert(partnerData);

    if (partnerError) {
        alert('Error guardando partner: ' + partnerError.message);
        return;
    }

    await window.supabaseClient.from('partner_links').delete().eq('partner_id', id);

    const linkRows = document.querySelectorAll('.admin-link-row');
    if (linkRows.length > 0) {
        const links = Array.from(linkRows)
            .map((row, i) => ({
                partner_id: id,
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
      <td data-label="Descripción">
        <div class="partner-desc">${c.description || '—'}</div>
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
            onclick="openCityModal('${c.id}')">Editar</button>
          <button type="button"
            class="admin-btn admin-btn--danger admin-btn--sm"
            onclick="toggleCityActive('${c.id}', ${c.active})">
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
          <th>Descripción</th>
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
        ? `Editando: ${cityId}`
        : 'Rellena los datos de la nueva ciudad';
    document.getElementById('cf-id').disabled = !!cityId;

    clearCityForm();

    if (cityId) {
        const { data: city } = await window.supabaseClient
            .from('cities')
            .select('*')
            .eq('id', cityId)
            .single();
        const { data: groups } = await window.supabaseClient
            .from('city_groups')
            .select('*')
            .eq('city_id', cityId)
            .order('sort_order');

        document.getElementById('cf-id').value = city.id;
        document.getElementById('cf-name').value = city.name;
        document.getElementById('cf-country').value = city.country;
        document.getElementById('cf-flag').value = city.flag;
        document.getElementById('cf-description').value = city.description || '';
        document.getElementById('cf-image').value = city.image_url || '';
        document.getElementById('cf-priority').value = city.priority;
        document.getElementById('cf-active').checked = city.active;

        for (const group of groups || []) {
            addGroupRow(group);
        }
    }

    document.getElementById('city-modal').hidden = false;
}

function closeCityModal() {
    document.getElementById('city-modal').hidden = true;
    clearCityForm();
}

function clearCityForm() {
    ['cf-id', 'cf-name', 'cf-country', 'cf-flag', 'cf-description', 'cf-image'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    document.getElementById('cf-priority').value = '0';
    document.getElementById('cf-active').checked = false;
    document.getElementById('groups-container').innerHTML = '';
}

function addGroupRow(group = {}) {
    const container = document.getElementById('groups-container');
    const row = document.createElement('div');
    row.className = 'admin-link-row';
    row.innerHTML = `
    <select class="group-platform">
      <option value="whatsapp" ${group.platform === 'whatsapp' ? 'selected' : ''}>WhatsApp</option>
      <option value="telegram" ${group.platform === 'telegram' ? 'selected' : ''}>Telegram</option>
    </select>
    <input class="group-label" type="text"
      placeholder="Nombre del grupo"
      value="${group.label || ''}" />
    <input class="group-url" type="text"
      placeholder="URL del grupo"
      value="${group.url || ''}" />
    <button type="button"
      class="admin-btn admin-btn--sm admin-btn--danger"
      onclick="this.parentElement.remove()">×</button>
  `;
    container.appendChild(row);
}

async function saveCity() {
    const id = document.getElementById('cf-id').value.trim();
    const name = document.getElementById('cf-name').value.trim();
    const country = document.getElementById('cf-country').value.trim();

    if (!id || !name || !country) {
        alert('ID, nombre y país son obligatorios.');
        return;
    }

    const cityData = {
        id,
        name,
        country,
        flag: document.getElementById('cf-flag').value.trim(),
        description: document.getElementById('cf-description').value.trim(),
        image_url: document.getElementById('cf-image').value.trim(),
        priority: parseInt(document.getElementById('cf-priority').value) || 0,
        active: document.getElementById('cf-active').checked,
    };

    const { error: cityError } = await window.supabaseClient.from('cities').upsert(cityData);

    if (cityError) {
        alert('Error guardando ciudad: ' + cityError.message);
        return;
    }

    await window.supabaseClient.from('city_groups').delete().eq('city_id', id);

    const groupRows = document.querySelectorAll('#groups-container .admin-link-row');

    if (groupRows.length > 0) {
        const groups = Array.from(groupRows)
            .map((row, i) => ({
                city_id: id,
                platform: row.querySelector('.group-platform').value,
                label: row.querySelector('.group-label').value.trim(),
                url: row.querySelector('.group-url').value.trim(),
                active: true,
                sort_order: i,
            }))
            .filter((g) => g.label && g.url);

        if (groups.length > 0) {
            const { error: groupsError } = await window.supabaseClient
                .from('city_groups')
                .insert(groups);
            if (groupsError) {
                alert('Error guardando grupos: ' + groupsError.message);
                return;
            }
        }
    }

    closeCityModal();
    await loadCities();
}

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
        const name = row.partners?.name || row.partner_id;
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
