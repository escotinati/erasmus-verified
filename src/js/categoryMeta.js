// ─────────────────────────────────────────────────────────────
//  CATEGORYMETA.JS — Erasmus Verified
//
//  CATEGORY_META vivía dentro de map-helpers.js — se extrae a su
//  propio archivo porque ya no es exclusivo del mapa: ciudad.html
//  (rama feature/city-no-map, ver cityPartners.js) necesita estos
//  mismos label/color/icon por categoría sin cargar Leaflet ni ningún
//  otro código que sepa de mapas. map-helpers.js (mapa.html) sigue
//  usándolo tal cual para sus pines, así que este script tiene que
//  cargarse ANTES que map-helpers.js en cualquier página que use los
//  dos (script clásico, sin import/export — variable global).
// ─────────────────────────────────────────────────────────────

const CATEGORY_META = {
    nightlife: { label: 'Nightlife', color: '#2563eb', icon: 'nightlife' },
    housing: { label: 'Alojamiento', color: '#0e7490', icon: 'home' },
    services: { label: 'Bar', color: '#ca8a04', icon: 'local_bar' },
    community: { label: 'Comunidad', color: '#16a34a', icon: 'groups' },
    travel: { label: 'Viajes', color: '#7c3aed', icon: 'flight' },
    restaurants: { label: 'Restaurantes', color: '#dc2626', icon: 'restaurant' },
    sports: { label: 'Deporte', color: '#ea580c', icon: 'sports_soccer' },
    culture: { label: 'Cultura', color: '#db2777', icon: 'theater_comedy' },
    shopping: { label: 'Compras', color: '#9333ea', icon: 'shopping_bag' },
    wellness: { label: 'Bienestar', color: '#059669', icon: 'spa' },
    events: { label: 'Eventos', color: '#d97706', icon: 'event' },
    education: { label: 'Formación', color: '#0284c7', icon: 'school' },
    transport: { label: 'Transporte', color: '#64748b', icon: 'directions_bus' },
    food: { label: 'Comida rápida', color: '#f59e0b', icon: 'fastfood' },
    coworking: { label: 'Coworking', color: '#0891b2', icon: 'business_center' },
    healthcare: { label: 'Salud', color: '#16a34a', icon: 'medical_services' },
    language: { label: 'Idiomas', color: '#7c3aed', icon: 'translate' },
    volunteering: { label: 'Voluntariado', color: '#be185d', icon: 'volunteer_activism' },
    music: { label: 'Música', color: '#1d4ed8', icon: 'music_note' },
    photography: { label: 'Fotografía', color: '#92400e', icon: 'photo_camera' },
};
