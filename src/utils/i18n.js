// ─────────────────────────────────────────────────────────────
//  I18N.JS — Erasmus Verified / Erasmus Parties
//
//  Helper mínimo para leer campos JSONB multiidioma (ver migración
//  supabase/migrations/20260712_i18n_jsonb.sql). MVP: solo ES + EN,
//  sin i18next ni selector de idioma en la UI todavía — eso es de una
//  fase posterior.
// ─────────────────────────────────────────────────────────────

// Idioma activo: localStorage tiene prioridad (para cuando exista un
// selector manual más adelante); si no hay nada guardado, se cae al
// idioma del navegador. Cualquier idioma que no sea 'es' se trata como
// 'en' (es el único fallback que soportamos en este MVP).
function getLang() {
    const stored = localStorage.getItem('lang');
    const lang = stored || navigator.language.slice(0, 2);
    return lang === 'es' ? 'es' : 'en';
}

// Extrae el valor de un campo JSONB multiidioma para el idioma activo.
// Compatible con datos legacy que todavía sean un string plano (antes
// de la migración a jsonb, o si algún dato se coló sin envolver).
function tField(jsonbValue, lang = getLang()) {
    if (jsonbValue === null || jsonbValue === undefined) return '';
    if (typeof jsonbValue === 'string') return jsonbValue;
    return jsonbValue[lang] ?? jsonbValue['es'] ?? jsonbValue['en'] ?? '';
}

// Traduce una cadena estática de la UI (no viene de Supabase, vive en
// translations.js) a partir de una clave con puntos, ej. "nav.services".
// Cae a español si falta en el idioma activo, y a la propia clave si
// tampoco existe en español (así un data-i18n con una clave mal escrita
// se nota a simple vista en vez de fallar en silencio).
function t(key) {
    const lang = getLang();
    const keys = key.split('.');
    const extract = (obj) => keys.reduce((o, k) => o?.[k], obj);
    return extract(window.I18n.translations?.[lang]) ?? extract(window.I18n.translations?.['es']) ?? key;
}

// Resuelve todos los [data-i18n] del DOM en el idioma activo. Se llama
// una vez, tras DOMContentLoaded (translations.js ya debe estar
// cargado) — no hay cambio de idioma sin recargar la página completa,
// así que no hace falta observar el DOM ni volver a llamarla después.
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const val = t(el.dataset.i18n);
        if (el.hasAttribute('placeholder')) {
            el.placeholder = val;
        } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.value = val;
        } else {
            el.textContent = val;
        }
    });
    // Actualiza el label del switcher según el idioma activo — hecho
    // aquí (no solo en langSwitcher.js) para que quede correcto incluso
    // si algo más en la página vuelve a llamar a applyTranslations().
    const switcher = document.getElementById('lang-switcher');
    if (switcher) switcher.textContent = getLang() === 'es' ? 'EN' : 'ES';
}

window.I18n = { getLang, tField, t, applyTranslations };
