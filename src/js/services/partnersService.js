// Próximos eventos reales (partner_events), con su partner y ciudad.
// RLS ya filtra en el servidor: solo activos y no vencidos (>1 día de
// margen) llegan aquí para usuarios anónimos — no hace falta filtrar
// otra vez en el cliente.
async function fetchUpcomingEvents(limit = 12) {
    const { data, error } = await window.supabaseClient
        .from('partner_events')
        .select('*, partners(id, name, image_url, cities(id, name, flag))')
        .order('starts_at', { ascending: true })
        .limit(limit);

    if (error) {
        console.error('[partnersService] error cargando eventos:', error);
        return [];
    }

    return data.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        theme: e.theme,
        image_url: e.image_url || e.partners?.image_url || '',
        starts_at: e.starts_at,
        price_label: e.price_label,
        ticket_url: e.ticket_url,
        priority: e.priority,
        partner: e.partners ? { id: e.partners.id, name: e.partners.name } : null,
        city: e.partners?.cities
            ? { id: e.partners.cities.id, name: e.partners.cities.name, flag: e.partners.cities.flag }
            : null,
    }));
}

// Devuelve TODOS los partners activos de categoría 'nightlife', sin
// filtrar por ciudad — usado por el mapa y la ficha de ciudad, que
// muestran el LOCAL, no sus eventos.
async function fetchNightlifePartners(limit = 12) {
    const { data: partners, error: partnersError } = await window.supabaseClient
        .from('partners')
        .select('*, cities(id, name, flag)')
        .eq('category', 'nightlife')
        .eq('active', true)
        .order('priority', { ascending: false })
        .limit(limit);

    if (partnersError) {
        console.error('[partnersService] error cargando nightlife partners:', partnersError);
        return [];
    }

    const partnerIds = partners.map((p) => p.id);
    if (partnerIds.length === 0) return [];

    const { data: links, error: linksError } = await window.supabaseClient
        .from('partner_links')
        .select('*')
        .in('partner_id', partnerIds)
        .order('sort_order', { ascending: true });

    if (linksError) {
        console.error('[partnersService] error cargando links:', linksError);
    }

    const linksByPartnerId = {};
    for (const link of links || []) {
        if (!linksByPartnerId[link.partner_id]) linksByPartnerId[link.partner_id] = [];
        linksByPartnerId[link.partner_id].push({
            type: link.type,
            label: link.label,
            url: link.url,
            sort_order: link.sort_order,
        });
    }

    return partners.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        image_url: p.image_url,
        priority: p.priority,
        city: p.cities ? { id: p.cities.id, name: p.cities.name, flag: p.cities.flag } : null,
        links: linksByPartnerId[p.id] || [],
    }));
}

async function fetchPartnersByCity(cityId) {
    const { data: partners, error: partnersError } = await window.supabaseClient
        .from('partners')
        .select('*')
        .eq('city_id', cityId)
        .eq('active', true)
        .order('priority', { ascending: false });

    if (partnersError) {
        console.error('[partnersService] error cargando partners:', partnersError);
        return [];
    }

    const partnerIds = partners.map((p) => p.id);

    if (partnerIds.length === 0) {
        return [];
    }

    const { data: links, error: linksError } = await window.supabaseClient
        .from('partner_links')
        .select('*')
        .in('partner_id', partnerIds)
        .order('sort_order', { ascending: true });

    if (linksError) {
        console.error('[partnersService] error cargando links:', linksError);
    }

    const linksByPartnerId = {};
    for (const link of links || []) {
        if (!linksByPartnerId[link.partner_id]) {
            linksByPartnerId[link.partner_id] = [];
        }
        linksByPartnerId[link.partner_id].push({
            type: link.type,
            label: link.label,
            url: link.url,
            sort_order: link.sort_order,
        });
    }

    return partners.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        city_id: p.city_id,
        lat: p.lat,
        lng: p.lng,
        description: p.description,
        image_url: p.image_url,
        priority: p.priority,
        active: p.active,
        links: linksByPartnerId[p.id] || [],
    }));
}

function groupPartnersByCategory(partners) {
    const byCategory = {};
    for (const partner of partners) {
        if (!byCategory[partner.category]) byCategory[partner.category] = [];
        byCategory[partner.category].push(partner);
    }

    return Object.keys(CATEGORY_META)
        .map((category) => ({ category, partners: byCategory[category] || [] }))
        .filter((group) => group.partners.length > 0);
}