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

const PARTNERS = [{
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
        links: [
            { type: 'WEBSITE', label: 'Web oficial', url: 'https://elcrystalbilbao.com/' },
        ],
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
        links: [
            { type: 'WEBSITE', label: 'Web oficial', url: 'https://salamoma.com/' },
        ],
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
 * Agrupa partners por categoría, devolviendo solo categorías con
 * al menos 1 partner (decisión tomada: no mostrar categorías vacías).
 * Devuelve: [{ category: 'nightlife', partners: [...] }, ...]
 */
function groupPartnersByCategory(partners) {
    const groups = {};
    for (const partner of partners) {
        if (!groups[partner.category]) groups[partner.category] = [];
        groups[partner.category].push(partner);
    }
    return Object.entries(groups).map(([category, partners]) => ({ category, partners }));
}