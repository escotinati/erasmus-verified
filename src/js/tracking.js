// Eventos que se guardan en cta_clicks (el resto solo va a consola). Añadir
// aquí un evento NUEVO solo tiene sentido si su payload trae `partnerId`:
// cta_clicks.partner_id es NOT NULL y clave foránea a partners, así que un
// clic sin partner (p. ej. un resultado de búsqueda que es una ciudad) no se
// puede guardar sin cambiar el esquema.
const PERSISTED_TRACKING_EVENTS = new Set([
    'partner_link_click', // enlace dentro del Sheet del partner (link_type = tipo del enlace)
    'partner_directions_click', // "Cómo llegar"
    'partner_card_click', // CTA de una card de partner del home
    'event_ticket_click', // "Ver evento" / entradas de una card de evento
    'search_result_click', // resultado del buscador del home (solo partner y evento)
]);

// Devuelve una Promise que resuelve cuando el INSERT ha terminado (o de inmediato
// si el evento no se persiste). Nunca rechaza. La mayoría de llamadores la
// ignoran; navigateToResult() (index.js) la espera antes de navegar en la MISMA
// pestaña, porque el navegador cancela los fetch en vuelo al descargar la página.
function trackEvent(eventName, payload = {}) {
    console.info('[tracking]', eventName, payload);

    if (!PERSISTED_TRACKING_EVENTS.has(eventName)) return Promise.resolve();

    // Sin partnerId no hay fila válida (ver arriba): se queda en consola, sin
    // intentar un INSERT que fallaría contra el NOT NULL / la FK.
    const partnerId = Number(payload.partnerId);
    if (!Number.isInteger(partnerId) || partnerId <= 0) return Promise.resolve();

    if (!window.supabaseClient) {
        console.warn('[tracking] supabaseClient no disponible, clic no registrado');
        return Promise.resolve();
    }

    return window.supabaseClient
        .from('cta_clicks')
        .insert({
            partner_id: partnerId,
            link_type: payload.linkType || payload.ctaType || eventName,
            domain: window.location.hostname,
            path: window.location.pathname,
        })
        .then(({ error }) => {
            if (error) console.warn('[tracking] clic no registrado:', error.message);
        })
        .catch((e) => console.warn('[tracking] clic no registrado:', e && e.message));
}
