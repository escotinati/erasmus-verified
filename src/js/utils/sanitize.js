// ─────────────────────────────────────────────────────────────
//  SANITIZE.JS — Erasmus Verified / Erasmus Parties
//
//  escapeHtml(): implementación movida tal cual desde admin.js (única
//  fuente de verdad ahora, sin duplicar). Úsala en cualquier campo de
//  Supabase (partners/cities/eventos) que se interpole dentro de un
//  innerHTML/insertAdjacentHTML — name, description, city, country...
//
//  sanitizeUrl(): valida que una URL tenga esquema http/https antes de
//  usarla en href/src (whatsapp_url, ticket_url, image_url, links de
//  partners). Rechaza cualquier otro esquema (ej. javascript:) y
//  devuelve el fallback en su lugar.
//
//  Sin ES Modules, como el resto del proyecto: funciones globales
//  (window.escapeHtml / window.sanitizeUrl), no export/import.
// ─────────────────────────────────────────────────────────────

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[ch]));
}

function sanitizeUrl(url, fallback = '') {
    if (!url) return fallback;
    try {
        const parsed = new URL(String(url));
        return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : fallback;
    } catch (e) {
        return fallback;
    }
}

window.escapeHtml = escapeHtml;
window.sanitizeUrl = sanitizeUrl;
