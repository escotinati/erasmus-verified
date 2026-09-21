// ─────────────────────────────────────────────────────────────
//  servicesData.js — servicios verificados (SIM, banca, transporte) que
//  pinta ServiceCards.jsx en servicios.html. Antes eran 6 bloques
//  <div class="service-card"> copiados a mano. Un solo sitio para
//  añadir/cambiar un servicio.
//
//  *Key: clave de I18n (translations.js). *Fallback: texto en español por
//  si I18n no estuviera cargado. `name` es literal (nombre de marca, no se
//  traduce). `delay`: anim-delay-N del scroll-reveal.
// ─────────────────────────────────────────────────────────────

export const SERVICE_SETS = {
    sim: [
        {
            delay: 1,
            icon: 'sim_card',
            name: 'Orange Holiday Europe',
            href: 'https://orangeholiday.orange.es',
            highlightKey: 'services.sim_orange_price',
            highlightFallback: '25€ / 30 días',
            descKey: 'services.sim_orange_desc',
            descFallback:
                '50 GB en roaming UE, llamadas ilimitadas dentro de la UE. Activación en tienda física.',
            ctaKey: 'services.view_offer_cta',
            ctaFallback: 'Ver oferta',
        },
        {
            delay: 2,
            icon: 'cell_tower',
            name: 'Lebara Europe',
            href: 'https://lebara.es',
            highlightKey: 'services.sim_lebara_price',
            highlightFallback: '18€ / 30 días',
            descKey: 'services.sim_lebara_desc',
            descFallback:
                '20 GB en roaming UE, llamadas ilimitadas a España. Compra 100% online, sin desplazarte a ninguna tienda.',
            ctaKey: 'services.view_offer_cta',
            ctaFallback: 'Ver oferta',
        },
        {
            delay: 3,
            icon: 'phone_iphone',
            name: 'eSIM Holafly',
            href: 'https://esim.holafly.com',
            highlightKey: 'services.sim_holafly_price',
            highlightFallback: '34€ / 30 días',
            descKey: 'services.sim_holafly_desc',
            descFallback:
                'Datos ilimitados en Europa sin SIM física. Activación instantánea desde tu teléfono, sin esperar ningún envío.',
            ctaKey: 'services.view_offer_cta',
            ctaFallback: 'Ver oferta',
        },
    ],
    bank: [
        {
            delay: 4,
            icon: 'account_balance',
            name: 'N26',
            href: 'https://n26.com/es-es',
            highlightKey: 'services.free_label',
            highlightFallback: 'Gratis',
            descKey: 'services.bank_n26_desc',
            descFallback:
                'Apertura 100% online en 10 minutos, sin domicilio fijo. Tarjeta virtual disponible de inmediato para compras y suscripciones.',
            ctaKey: 'services.open_account_cta',
            ctaFallback: 'Abrir cuenta',
        },
        {
            delay: 5,
            icon: 'currency_exchange',
            name: 'Revolut',
            href: 'https://revolut.com',
            highlightKey: 'services.free_label',
            highlightFallback: 'Gratis',
            descKey: 'services.bank_revolut_desc',
            descFallback:
                'Cambio de divisa sin comisión, apertura online inmediata. Ideal si viajas entre distintos países durante tu Erasmus.',
            ctaKey: 'services.open_account_cta',
            ctaFallback: 'Abrir cuenta',
        },
    ],
    transport: [
        {
            delay: 6,
            icon: 'directions_bus',
            name: 'Barik · Bilbao',
            href: 'https://barik.eus',
            highlightKey: 'services.transport_barik_price',
            highlightFallback: '~20€/mes (tarifa joven)',
            descKey: 'services.transport_barik_desc',
            descFallback:
                'Tarjeta recargable para bus, metro y tranvía en el Gran Bilbao. Descuento adicional con carnet de estudiante UE. Disponible en estaciones y puntos de venta oficiales.',
            ctaKey: 'services.transport_barik_cta',
            ctaFallback: 'Puntos de venta',
        },
    ],
    // Cards del home (index.html). `nameKey`: el título también se traduce (a
    // diferencia de los servicios de servicios.html, cuyo nombre es de marca).
    // `to`: enlace INTERNO. Sin `to` no hay CTA — la card de seguro no tiene
    // destino todavía (antes era un href="#" muerto): añadir `to` + ctaKey/
    // ctaFallback cuando exista página o proveedor.
    home: [
        {
            icon: 'home',
            nameKey: 'home.service_housing_title',
            nameFallback: 'Alojamiento verificado',
            descKey: 'home.service_housing_desc',
            descFallback:
                'Evita las estafas. Ofrecemos una lista curada de apartamentos y casas compartidas con contratos digitales y verificación de identidad.',
            ctaKey: 'home.service_housing_cta',
            ctaFallback: 'Explorar anuncios',
            to: 'alojamiento.html',
        },
        {
            icon: 'shield',
            nameKey: 'home.service_insurance_title',
            nameFallback: 'Seguro de intercambio',
            descKey: 'home.service_insurance_desc',
            descFallback:
                'Seguro de salud y viaje integral diseñado para estudiantes internacionales. Totalmente compatible con los requisitos universitarios.',
        },
        {
            icon: 'language',
            nameKey: 'home.service_sim_title',
            nameFallback: 'SIM local y banca',
            descKey: 'home.service_sim_desc',
            descFallback:
                'Consigue tu número europeo y cuenta bancaria antes de aterrizar. Sin papeleos, todo digital y sencillo.',
            ctaKey: 'home.service_sim_cta',
            ctaFallback: 'Pedir ahora',
            to: 'servicios.html',
        },
    ],
};
