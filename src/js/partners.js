// ─────────────────────────────────────────────────────────────
//  PARTNERS.JS — Erasmus Parties
//
//  Datos de partners por ciudad. Array global filtrado por `ciudad`
//  al cargar cada mapa (decisión tomada: no archivo-por-ciudad,
//  ya que solo Bilbao tiene partners reales por ahora).
//
//  Cada partner tiene una lista de `links` (0-N enlaces), en vez de
//  un único CTA — decisión tomada para reflejar: web del local,
//  entradas externas, y (futuro) fiesta propia organizada por
//  Erasmus Parties.
//
//  link.type:
//    'WEBSITE'  → web oficial del local
//    'TICKETS'  → entradas externas (Fourvenues u otra ticketera)
//    'OWN_EVENT'→ página propia de Erasmus Parties para esa fiesta
//                 (null/ausente hasta que ese desarrollo exista)
// ─────────────────────────────────────────────────────────────

const PARTNERS = [
    {
        id: 'p-backstage',
        name: 'Backstage',
        category: 'nightlife',
        pais: 'España',
        ciudad: 'Bilbao',
        lat: 43.26434372923213,
        lng: -2.927561704545239,
        description: 'BackRoom + StageLive: discoteca y conciertos junto a la ría.',
        links: [
            { type: 'WEBSITE', label: 'Web oficial', url: 'https://backandstage.com/' },
            // TICKETS: pendiente de URL real de ticketera
            // OWN_EVENT: pendiente (no existe esa sección en la web todavía)
        ],
    },
    {
        id: 'p-crystal',
        name: 'Crystal',
        category: 'nightlife',
        pais: 'España',
        ciudad: 'Bilbao',
        lat: 43.26285383094336,
        lng: -2.923961564410484,
        description: 'Discoteca histórica de Bilbao, reabierta en el centro de la villa.',
        links: [{ type: 'WEBSITE', label: 'Web oficial', url: 'https://elcrystalbilbao.com/' }],
    },
    {
        id: 'p-moma',
        name: 'Moma',
        category: 'nightlife',
        pais: 'España',
        ciudad: 'Bilbao',
        lat: 43.26413788816102,
        lng: -2.9437044426587358,
        description: 'Sala de moda en Bilbao, ambiente exclusivo y diseño vanguardista.',
        links: [{ type: 'WEBSITE', label: 'Web oficial', url: 'https://salamoma.com/' }],
    },
    {
        id: 'p-poza-40',
        name: 'Poza 40',
        category: 'services',
        pais: 'España',
        ciudad: 'Bilbao',
        lat: 43.26226608828083,
        lng: -2.941281431836744,
        description: 'Bar en el corazón del Casco Viejo de Bilbao.',
        links: [],
    },
    {
        id: 'p-molly-malone',
        name: 'Molly Malone',
        category: 'services',
        pais: 'España',
        ciudad: 'Bilbao',
        lat: 43.2637959496962,
        lng: -2.9406155605893156,
        description: 'Irish pub clásico en Bilbao, ambiente animado toda la semana.',
        links: [],
    },
    {
        id: 'p-crazy-horse',
        name: 'Crazy Horse',
        category: 'services',
        pais: 'España',
        ciudad: 'Bilbao',
        lat: 43.270424424134475,
        lng: -2.932106477008702,
        description: 'Bar de copas con ambiente internacional en Bilbao.',
        links: [],
    },
];

/**
 * Devuelve los partners de una ciudad concreta.
 * Usado por mapPartners.js para no acoplar el resto del código
 * al array global completo.
 */
function getPartnersByCity(ciudad) {
    return PARTNERS.filter((p) => p.ciudad === ciudad);
}

/**
 * Agrupa partners por categoría. Solo devuelve categorías con al menos
 * un partner — las vacías se omiten.
 * Devuelve: [{ category: 'nightlife', partners: [...] }, ...]
 */
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
