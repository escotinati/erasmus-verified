// ─────────────────────────────────────────────────────────────
//  LANGSWITCHER.JS — Erasmus Verified / Erasmus Parties
//
//  Cambio de idioma con recarga completa (opción elegida, no SPA):
//  guarda el idioma en localStorage y recarga la página para que
//  applyTranslations() y tField() se resuelvan de cero en el nuevo
//  idioma, sin tener que reescribir el DOM en caliente.
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('lang-switcher');
    if (!btn) return;
    btn.textContent = window.I18n.getLang() === 'es' ? 'EN' : 'ES';
    btn.addEventListener('click', function () {
        const next = window.I18n.getLang() === 'es' ? 'en' : 'es';
        localStorage.setItem('lang', next);
        location.reload();
    });
});
