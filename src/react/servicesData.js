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
};
