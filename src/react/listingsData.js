// ─────────────────────────────────────────────────────────────
//  listingsData.js — datos de ejemplo para las fichas individuales
//  de alojamiento.html/viaje.html (ListingDetail.jsx).
//
//  PROVISIONAL: esto sustituye a una tabla real de Supabase que
//  todavía no existe (acordado explícitamente con Álvaro — "tabla
//  nueva en Supabase" es el plan, esto es solo para poder navegar e
//  iterar el diseño real de la página antes de esa migración). Mismo
//  criterio que collabData.js/servicesData.js: datos de desarrollador,
//  no de usuario, así que no hace falta escapeHtml() en los campos de
//  texto — sí se sanea la URL externa (ctaHref) en ListingDetail.jsx,
//  igual que hace Card.jsx con cualquier href, para no tener que
//  recordar quitarlo el día que esto sí venga de Supabase.
//
//  Forma de cada entrada: { id, title, linkType: 'externo'|'interno',
//  source, ctaHref? (solo si linkType es 'externo'), location, price,
//  priceUnit, description, features: [{ icon, label }], photoCount }.
//  `linkType: 'interno'` no lleva ctaHref — su CTA todavía no tiene
//  destino funcional (pendiente de decidir, ver CLAUDE.md).
//  `photoCount`: cuántas fotos "tendría" esta ficha — hoy todas son el
//  mismo placeholder liso (sin URLs reales todavía, ver el propio
//  comentario de arriba), pero el número real ya alimenta la galería
//  y el lightbox (ListingGalleryLightbox.jsx) para que ese flujo esté
//  listo en cuanto haya fotos de verdad.
// ─────────────────────────────────────────────────────────────

export const LISTINGS = {
    alojamiento: [
        {
            id: 1,
            title: 'Habitación en piso compartido — Eixample',
            linkType: 'externo',
            source: 'Uniplaces',
            ctaHref: 'https://www.uniplaces.com',
            location: 'Eixample, Barcelona',
            price: '450 €',
            priceUnit: '/ mes',
            description:
                'Habitación individual en piso compartido de 4, totalmente amueblada y a 12 minutos a pie de la Universidad de Barcelona. Publicado por Uniplaces, plataforma verificada por la comunidad Erasmus.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'chair', label: 'Amueblado' },
                { icon: 'payments', label: 'Gastos incluidos' },
                { icon: 'school', label: '12 min a la universidad' },
            ],
            photoCount: 9,
        },
        {
            id: 2,
            title: 'Residencia Erasmus Verified — Zona Universitaria',
            linkType: 'interno',
            source: 'Erasmus Verified',
            location: 'Zona Universitaria, Barcelona',
            price: '395 €',
            priceUnit: '/ mes',
            description:
                'Plaza en residencia gestionada directamente por el equipo de Erasmus Verified, con contrato digital, fianza reducida y soporte en español e inglés durante toda tu estancia.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'cleaning_services', label: 'Limpieza semanal' },
                { icon: 'security', label: 'Fianza reducida' },
                { icon: 'support_agent', label: 'Soporte 24/7' },
            ],
            photoCount: 6,
        },
        {
            id: 3,
            title: 'Estudio en Gràcia',
            linkType: 'externo',
            source: 'Spotahome',
            ctaHref: 'https://www.spotahome.com',
            location: 'Gràcia, Barcelona',
            price: '520 €',
            priceUnit: '/ mes',
            description:
                'Estudio reformado en el barrio de Gràcia, alquiler sin visita presencial y reserva 100% online. Publicado por Spotahome.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'kitchen', label: 'Cocina equipada' },
                { icon: 'local_laundry_service', label: 'Lavadora' },
                { icon: 'balcony', label: 'Balcón' },
            ],
            photoCount: 7,
        },
        {
            id: 4,
            title: 'Piso en Poblenou',
            linkType: 'externo',
            source: 'HousingAnywhere',
            ctaHref: 'https://housinganywhere.com',
            location: 'Poblenou, Barcelona',
            price: '610 €',
            priceUnit: '/ mes',
            description:
                'Habitación en piso de 3 cerca de la playa, ideal para estudiantes Erasmus que buscan ambiente internacional. Publicado por HousingAnywhere.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'beach_access', label: '10 min a la playa' },
                { icon: 'groups', label: 'Piso internacional' },
                { icon: 'payments', label: 'Gastos incluidos' },
            ],
            photoCount: 11,
        },
    ],
    viaje: [
        {
            id: 1,
            title: 'FlixBus — Barcelona → Ámsterdam',
            linkType: 'externo',
            source: 'FlixBus',
            ctaHref: 'https://www.flixbus.es',
            location: 'Sale de Barcelona Nord',
            price: '39 €',
            priceUnit: '/ persona',
            description:
                'Trayecto directo en autobús nocturno con wifi y enchufe individual en cada asiento. Publicado por FlixBus, plataforma verificada por la comunidad Erasmus.',
            features: [
                { icon: 'schedule', label: 'Duración: 14h 30min' },
                { icon: 'luggage', label: '1 maleta incluida' },
                { icon: 'event_seat', label: 'Asiento reservado' },
                { icon: 'wifi', label: 'WiFi a bordo' },
            ],
            photoCount: 5,
        },
        {
            id: 2,
            title: 'Excursión de fin de semana — Costa Brava',
            linkType: 'interno',
            source: 'Erasmus Verified',
            location: 'Sale de Barcelona',
            price: '89 €',
            priceUnit: '/ persona',
            description:
                'Excursión de fin de semana organizada por el equipo de Erasmus Verified: transporte, alojamiento y actividades incluidas, en grupo reducido de estudiantes Erasmus.',
            features: [
                { icon: 'directions_bus', label: 'Transporte incluido' },
                { icon: 'hotel', label: 'Alojamiento 2 noches' },
                { icon: 'groups', label: 'Grupo reducido' },
                { icon: 'support_agent', label: 'Guía en español/inglés' },
            ],
            photoCount: 8,
        },
        {
            id: 3,
            title: 'BlaBlaCar — Barcelona → Valencia',
            linkType: 'externo',
            source: 'BlaBlaCar',
            ctaHref: 'https://www.blablacar.es',
            location: 'Sale de Barcelona',
            price: '18 €',
            priceUnit: '/ persona',
            description:
                'Trayecto compartido en coche entre estudiantes, la forma más económica de moverte entre ciudades. Publicado por BlaBlaCar.',
            features: [
                { icon: 'schedule', label: 'Duración: 3h 30min' },
                { icon: 'luggage', label: '1 maleta incluida' },
                { icon: 'chat', label: 'Conductor verificado' },
                { icon: 'eco', label: 'Menos emisiones' },
            ],
            photoCount: 4,
        },
        {
            id: 4,
            title: 'Omio — Barcelona → París',
            linkType: 'externo',
            source: 'Omio',
            ctaHref: 'https://www.omio.es',
            location: 'Sale de Barcelona Sants',
            price: '55 €',
            priceUnit: '/ persona',
            description:
                'Compara trenes, buses y vuelos en una sola búsqueda y reserva el trayecto que mejor te encaje. Publicado por Omio.',
            features: [
                { icon: 'schedule', label: 'Duración: desde 6h 30min' },
                { icon: 'compare_arrows', label: 'Varias opciones de trayecto' },
                { icon: 'confirmation_number', label: 'Billete digital' },
                { icon: 'wifi', label: 'WiFi a bordo' },
            ],
            photoCount: 6,
        },
    ],
};
