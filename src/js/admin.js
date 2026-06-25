let editingPartnerId = null;

document.addEventListener('DOMContentLoaded', async function () {
    const {
        data: { session },
    } = await window.supabaseClient.auth.getSession();
    session ? showPanel() : showLogin();

    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('new-partner-btn').addEventListener('click', () => openModal(null));
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', savePartner);
    document.getElementById('add-link-btn').addEventListener('click', () => addLinkRow());
    document.querySelector('.admin-modal__backdrop').addEventListener('click', closeModal);
});

async function login() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.textContent = '';

    const { error } = await window.supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        errorEl.textContent = 'Credenciales incorrectas.';
        return;
    }
    showPanel();
}

async function logout() {
    await window.supabaseClient.auth.signOut();
    showLogin();
}

function showLogin() {
    document.getElementById('login-view').hidden = false;
    document.getElementById('panel-view').hidden = true;
}

async function showPanel() {
    document.getElementById('login-view').hidden = true;
    document.getElementById('panel-view').hidden = false;
    await Promise.all([loadPartners(), loadClicksReport()]);
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
    if (partners.length === 0) {
        wrap.innerHTML = '<p class="admin-empty">No hay partners todavía.</p>';
        return;
    }

    const rows = partners
        .map(
            (p) => `
    <tr>
      <td>${p.name}</td>
      <td><span class="admin-badge admin-badge--${p.category}">${p.category}</span></td>
      <td>${p.ciudad}</td>
      <td>${p.priority}</td>
      <td>${p.active ? '✓' : '—'}</td>
      <td>
        <button type="button" class="admin-btn admin-btn--sm"
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
    <div class="admin-clicks__row">
      <span class="admin-clicks__name">${name}</span>
      <span class="admin-clicks__count">${count}</span>
    </div>`
        )
        .join('');

    document.getElementById('clicks-report').innerHTML = rows;
}
