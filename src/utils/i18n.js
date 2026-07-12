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

window.I18n = { getLang, tField };
