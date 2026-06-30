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
