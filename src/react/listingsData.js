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
//  texto.
//
//  Sin distinción de terceros: TODO alojamiento y TODO viaje está
//  gestionado directamente por Erasmus Verified — no hay ya un
//  `linkType`/`source`/`ctaHref` que distinga una ficha "propia" de un
//  colaborador externo (decisión explícita de Álvaro; la sección de
//  "Plataformas colaboradoras" y CollabGrid.jsx se retiraron de
//  alojamientos.html/viajes.html por el mismo motivo). ListingDetail.jsx
//  ya no bifurca por tipo: badge "Reserva directa", precio "Gestionado
//  directamente por Erasmus Verified" y CTA "Solicitar información" +
//  "Ver disponibilidad" para todas las fichas, sin excepción.
//
//  Forma de cada entrada: { id, title, location, price, priceUnit,
//  description, features: [{ icon, label }], photoCount }.
//  `photoCount`: cuántas fotos "tendría" esta ficha — hoy todas son el
//  mismo placeholder liso (sin URLs reales todavía), pero el número
//  real ya alimenta la galería y el lightbox (ListingGalleryLightbox.jsx)
//  para que ese flujo esté listo en cuanto haya fotos de verdad.
// ─────────────────────────────────────────────────────────────

export const LISTINGS = {
    alojamiento: [
        {
            id: 1,
            title: 'Residencia Erasmus Verified — Zona Universitaria',
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
            id: 2,
            title: 'Habitación en piso compartido — Eixample',
            location: 'Eixample, Barcelona',
            price: '450 €',
            priceUnit: '/ mes',
            description:
                'Habitación individual en piso compartido de 4, totalmente amueblada y a 12 minutos a pie de la Universidad de Barcelona. Gestionado directamente por nuestro equipo, sin intermediarios.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'chair', label: 'Amueblado' },
                { icon: 'payments', label: 'Gastos incluidos' },
                { icon: 'school', label: '12 min a la universidad' },
            ],
            photoCount: 9,
        },
        {
            id: 3,
            title: 'Estudio en Gràcia',
            location: 'Gràcia, Barcelona',
            price: '520 €',
            priceUnit: '/ mes',
            description:
                'Estudio reformado en el barrio de Gràcia, contrato digital y reserva 100% online sin necesidad de visita presencial.',
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
            location: 'Poblenou, Barcelona',
            price: '610 €',
            priceUnit: '/ mes',
            description:
                'Habitación en piso de 3 cerca de la playa, ideal para estudiantes Erasmus que buscan ambiente internacional. Todo el proceso de reserva lo lleva nuestro equipo.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'beach_access', label: '10 min a la playa' },
                { icon: 'groups', label: 'Piso internacional' },
                { icon: 'payments', label: 'Gastos incluidos' },
            ],
            photoCount: 11,
        },
        {
            id: 5,
            title: 'Habitación en piso compartido — El Born',
            location: 'El Born, Barcelona',
            price: '480 €',
            priceUnit: '/ mes',
            description:
                'Habitación luminosa en piso histórico del Born, a un paso de bares y restaurantes. Fianza reducida y contrato en español o inglés.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'chair', label: 'Amueblado' },
                { icon: 'security', label: 'Fianza reducida' },
                { icon: 'nightlife', label: 'Zona de ocio cerca' },
            ],
            photoCount: 8,
        },
        {
            id: 6,
            title: 'Ático con terraza — Sant Antoni',
            location: 'Sant Antoni, Barcelona',
            price: '560 €',
            priceUnit: '/ mes',
            description:
                'Habitación en ático con terraza compartida en Sant Antoni, cerca del mercado y con buena conexión de metro a las principales universidades.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'deck', label: 'Terraza compartida' },
                { icon: 'directions_subway', label: 'Metro a 5 min' },
                { icon: 'kitchen', label: 'Cocina equipada' },
            ],
            photoCount: 5,
        },
        {
            id: 7,
            title: 'Piso compartido — Sants',
            location: 'Sants, Barcelona',
            price: '430 €',
            priceUnit: '/ mes',
            description:
                'Habitación en piso de 4 estudiantes cerca de la estación de Sants, perfecta si vas a viajar mucho durante tu Erasmus. Contrato flexible por cuatrimestre.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'train', label: 'Junto a Sants Estació' },
                { icon: 'payments', label: 'Gastos incluidos' },
                { icon: 'event_available', label: 'Contrato por cuatrimestre' },
            ],
            photoCount: 6,
        },
        {
            id: 8,
            title: 'Estudio reformado en Sarrià',
            location: 'Sarrià, Barcelona',
            price: '590 €',
            priceUnit: '/ mes',
            description:
                'Estudio tranquilo en una de las zonas más residenciales de Barcelona, ideal para quien busca estudiar sin ruido. Totalmente equipado y listo para entrar.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'kitchen', label: 'Cocina equipada' },
                { icon: 'volume_off', label: 'Zona tranquila' },
                { icon: 'local_laundry_service', label: 'Lavadora' },
            ],
            photoCount: 7,
        },
        {
            id: 9,
            title: 'Habitación en residencia — Diagonal',
            location: 'Diagonal, Barcelona',
            price: '410 €',
            priceUnit: '/ mes',
            description:
                'Plaza en residencia con zonas comunes, gimnasio y sala de estudio, gestionada directamente por Erasmus Verified con soporte durante toda tu estancia.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'fitness_center', label: 'Gimnasio incluido' },
                { icon: 'menu_book', label: 'Sala de estudio' },
                { icon: 'support_agent', label: 'Soporte 24/7' },
            ],
            photoCount: 9,
        },
        {
            id: 10,
            title: 'Piso de 2 habitaciones — Vila Olímpica',
            location: 'Vila Olímpica, Barcelona',
            price: '650 €',
            priceUnit: '/ mes',
            description:
                'Piso completo para compartir entre 2 estudiantes, a 5 minutos de la playa y con muy buena conexión con el centro. Reserva y contrato 100% gestionados por nuestro equipo.',
            features: [
                { icon: 'wifi', label: 'WiFi incluido' },
                { icon: 'beach_access', label: '5 min a la playa' },
                { icon: 'chair', label: 'Amueblado' },
                { icon: 'ac_unit', label: 'Aire acondicionado' },
            ],
            photoCount: 10,
        },
    ],
    viaje: [
        {
            id: 1,
            title: 'Excursión de fin de semana — Costa Brava',
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
            id: 2,
            title: 'Escapada a Andorra — Compras y montaña',
            location: 'Sale de Barcelona',
            price: '65 €',
            priceUnit: '/ persona',
            description:
                'Día completo en Andorra organizado por nuestro equipo: transporte ida y vuelta en autobús privado, tiempo libre para compras y paisajes de montaña.',
            features: [
                { icon: 'directions_bus', label: 'Transporte ida y vuelta' },
                { icon: 'schedule', label: 'Duración: 1 día' },
                { icon: 'groups', label: 'Grupo reducido' },
                { icon: 'shopping_bag', label: 'Tiempo libre para compras' },
            ],
            photoCount: 5,
        },
        {
            id: 3,
            title: 'Ruta de senderismo por los Pirineos',
            location: 'Sale de Barcelona',
            price: '75 €',
            priceUnit: '/ persona',
            description:
                'Excursión de un día a los Pirineos catalanes con ruta de senderismo guiada, apta para todos los niveles, y comida incluida en refugio de montaña.',
            features: [
                { icon: 'directions_bus', label: 'Transporte incluido' },
                { icon: 'hiking', label: 'Ruta guiada' },
                { icon: 'restaurant', label: 'Comida incluida' },
                { icon: 'groups', label: 'Grupo reducido' },
            ],
            photoCount: 6,
        },
        {
            id: 4,
            title: 'Fin de semana en Ibiza',
            location: 'Sale de Barcelona',
            price: '159 €',
            priceUnit: '/ persona',
            description:
                'Escapada de fin de semana a Ibiza organizada por Erasmus Verified: vuelo, alojamiento y traslados incluidos, con tiempo libre para playa y noche.',
            features: [
                { icon: 'flight', label: 'Vuelo incluido' },
                { icon: 'hotel', label: 'Alojamiento 2 noches' },
                { icon: 'beach_access', label: 'Tiempo libre en playa' },
                { icon: 'groups', label: 'Grupo reducido' },
            ],
            photoCount: 9,
        },
        {
            id: 5,
            title: 'Excursión a Girona y Figueres',
            location: 'Sale de Barcelona',
            price: '55 €',
            priceUnit: '/ persona',
            description:
                'Día completo visitando el casco antiguo de Girona y el Teatro-Museo Dalí en Figueres, con guía incluido en todo el recorrido.',
            features: [
                { icon: 'directions_bus', label: 'Transporte incluido' },
                { icon: 'museum', label: 'Entrada al Museo Dalí' },
                { icon: 'support_agent', label: 'Guía en español/inglés' },
                { icon: 'schedule', label: 'Duración: 1 día' },
            ],
            photoCount: 7,
        },
        {
            id: 6,
            title: 'Ruta enológica por el Priorat',
            location: 'Sale de Barcelona',
            price: '69 €',
            priceUnit: '/ persona',
            description:
                'Visita a dos bodegas de la D.O. Priorat con cata incluida, comida tradicional catalana y transporte de ida y vuelta desde Barcelona.',
            features: [
                { icon: 'directions_bus', label: 'Transporte incluido' },
                { icon: 'wine_bar', label: 'Cata en 2 bodegas' },
                { icon: 'restaurant', label: 'Comida incluida' },
                { icon: 'groups', label: 'Grupo reducido' },
            ],
            photoCount: 6,
        },
        {
            id: 7,
            title: 'Escapada a Zaragoza',
            location: 'Sale de Barcelona',
            price: '95 €',
            priceUnit: '/ persona',
            description:
                'Fin de semana en Zaragoza con visita guiada a la Basílica del Pilar y al casco histórico, alojamiento incluido para una noche.',
            features: [
                { icon: 'directions_bus', label: 'Transporte incluido' },
                { icon: 'hotel', label: 'Alojamiento 1 noche' },
                { icon: 'support_agent', label: 'Guía en español/inglés' },
                { icon: 'groups', label: 'Grupo reducido' },
            ],
            photoCount: 5,
        },
        {
            id: 8,
            title: 'Fin de semana en San Sebastián',
            location: 'Sale de Barcelona',
            price: '135 €',
            priceUnit: '/ persona',
            description:
                'Escapada de fin de semana a San Sebastián, con alojamiento, transporte y ruta de pintxos incluida en el precio.',
            features: [
                { icon: 'directions_bus', label: 'Transporte incluido' },
                { icon: 'hotel', label: 'Alojamiento 2 noches' },
                { icon: 'restaurant', label: 'Ruta de pintxos incluida' },
                { icon: 'groups', label: 'Grupo reducido' },
            ],
            photoCount: 8,
        },
        {
            id: 9,
            title: 'Excursión a Montserrat',
            location: 'Sale de Barcelona',
            price: '45 €',
            priceUnit: '/ persona',
            description:
                'Medio día en el monasterio de Montserrat con transporte incluido, tiempo libre para explorar el macizo y visitar la basílica.',
            features: [
                { icon: 'directions_bus', label: 'Transporte incluido' },
                { icon: 'landscape', label: 'Vistas al macizo' },
                { icon: 'schedule', label: 'Duración: medio día' },
                { icon: 'groups', label: 'Grupo reducido' },
            ],
            photoCount: 4,
        },
        {
            id: 10,
            title: 'Viaje de 3 días a Sevilla',
            location: 'Sale de Barcelona',
            price: '189 €',
            priceUnit: '/ persona',
            description:
                'Viaje de 3 días a Sevilla con vuelo, alojamiento y visitas guiadas a la Catedral, el Alcázar y el Barrio de Santa Cruz incluidas.',
            features: [
                { icon: 'flight', label: 'Vuelo incluido' },
                { icon: 'hotel', label: 'Alojamiento 3 noches' },
                { icon: 'support_agent', label: 'Guía en español/inglés' },
                { icon: 'groups', label: 'Grupo reducido' },
            ],
            photoCount: 10,
        },
    ],
};
