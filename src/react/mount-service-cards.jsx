// ─────────────────────────────────────────────────────────────
//  mount-service-cards.jsx — dos vías de montaje:
//   1. Auto-monta sobre cada <div data-services-grid="sim|bank|transport">
//      (servicios.html), resolviendo los textos con t() (I18n) al montar.
//   2. window.mountServiceCards(containerEl, items) — para ciudad.js
//      (script clásico), que pinta el grid con innerHTML y monta las
//      cards DESPUÉS, sobre el contenedor ya insertado. Devuelve
//      { unmount() }: cada llamada crea un root nuevo, y el contenedor
//      no vive toda la vida de la página (ver "root efímero" en CLAUDE.md).
// ─────────────────────────────────────────────────────────────

import { createRoot } from 'react-dom/client';
import ServiceCards from './ServiceCards.jsx';
import { SERVICE_SETS } from './servicesData.js';
import { t } from './navShared.jsx';

function resolveSet(set) {
    return (SERVICE_SETS[set] || []).map((s) => ({
        icon: s.icon,
        name: s.name,
        highlight: t(s.highlightKey, s.highlightFallback),
        description: t(s.descKey, s.descFallback),
        ctaLabel: t(s.ctaKey, s.ctaFallback),
        ctaHref: s.href,
        delay: s.delay,
    }));
}

document.querySelectorAll('[data-services-grid]').forEach((el) => {
    createRoot(el).render(<ServiceCards items={resolveSet(el.dataset.servicesGrid)} />);
});

window.mountServiceCards = function mountServiceCards(containerEl, items) {
    const root = createRoot(containerEl);
    root.render(<ServiceCards items={items} />);
    return { unmount: () => root.unmount() };
};
