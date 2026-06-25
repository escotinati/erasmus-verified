// ─────────────────────────────────────────────────────────────
//  TRACKING.JS — Erasmus Verified / Erasmus Parties
//
//  Contrato definitivo de tracking. En Fase 3 el interior de
//  trackEvent() se sustituirá por un insert en Supabase.
//  Ningún otro archivo cambiará cuando eso ocurra.
//
//  Se expone como global (window.trackEvent) para que funcione
//  sin bundler ni import/export, igual que el resto del JS.
// ─────────────────────────────────────────────────────────────
function trackEvent(eventName, payload = {}) {
    const event = {
        event: eventName,
        ...payload,
        domain: window.location.hostname,
        path: window.location.pathname,
        ts: new Date().toISOString(),
    };
    console.info('[tracking]', event);
    // FASE 3: aquí irá el insert en la tabla cta_clicks de Supabase
}
