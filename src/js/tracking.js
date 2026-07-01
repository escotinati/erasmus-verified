function trackEvent(eventName, payload = {}) {
    console.info('[tracking]', eventName, payload);

    if (eventName !== 'partner_link_click' && eventName !== 'partner_directions_click') return;

    if (!window.supabaseClient) {
        console.warn('[tracking] supabaseClient no disponible, clic no registrado');
        return;
    }

    window.supabaseClient
        .from('cta_clicks')
        .insert({
            partner_id: payload.partnerId,
            link_type: payload.linkType || payload.ctaType || eventName,
            domain: window.location.hostname,
            path: window.location.pathname,
        })
        .then(({ error }) => {
            if (error) console.warn('[tracking] clic no registrado:', error.message);
        });
}
