// ─────────────────────────────────────────────────────────────
//  NOTFOUND.JS — 404.html
//
//  Rellena la ruta real que el visitante intentó abrir dentro de la
//  burbuja del chat (window.location.pathname + search, con
//  textContent — nunca innerHTML: es la única página de la web que
//  muestra texto que viene directamente de la barra de direcciones
//  del propio visitante sobre sí mismo, así que no hace falta
//  sanitize.js para este dato en concreto).
//
//  Orquesta la única animación de la página: tras que las dos
//  burbujas hayan terminado de entrar (ver los animation-delay de
//  .notfound-bubble en not-found.css), aparece el indicador de
//  "escribiendo…" y, pasado un rato, se sustituye por el mensaje de
//  sistema "Esta página salió del grupo". Respeta
//  prefers-reduced-motion: sin animación, el mensaje de sistema
//  aparece directamente, sin esperar.
// ─────────────────────────────────────────────────────────────

function initNotFoundPage() {
    const pathEl = document.getElementById('notfoundPath');
    if (pathEl) {
        const attempted = window.location.pathname + window.location.search;
        pathEl.textContent = attempted || '/';
    }

    const typingEl = document.getElementById('notfoundTyping');
    const systemEl = document.getElementById('notfoundSystem');
    if (!typingEl || !systemEl) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        systemEl.classList.add('is-visible');
        return;
    }

    // Las dos burbujas terminan de entrar a los 1300ms (950ms de
    // animation-delay + 350ms de duración, ver not-found.css) — el
    // "escribiendo…" aparece justo después, se queda visible 1200ms y
    // da paso al mensaje de sistema.
    window.setTimeout(() => {
        typingEl.classList.add('is-visible');
    }, 1400);

    window.setTimeout(() => {
        typingEl.classList.remove('is-visible');
        systemEl.classList.add('is-visible');
    }, 2600);
}

document.addEventListener('DOMContentLoaded', initNotFoundPage);
