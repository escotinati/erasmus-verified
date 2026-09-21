// ─────────────────────────────────────────────────────────────
//  mount-city-cards.jsx — expone window.mountCityCards(containerEl,
//  items, options) para ciudades.js y ciudades-todas.html (scripts
//  clásicos). Devuelve { unmount() }.
//
//  Root EFÍMERO: ciudades-todas.html regenera los grupos de letra por
//  completo en cada tecleo del filtro (nuevos contenedores cada vez), así
//  que quien llama debe hacer unmount() de los roots anteriores antes de
//  quitar sus contenedores — ver "root efímero" en CLAUDE.md.
// ─────────────────────────────────────────────────────────────

import { createRoot } from 'react-dom/client';
import CityCards from './CityCards.jsx';

window.mountCityCards = function mountCityCards(containerEl, items, options = {}) {
    const root = createRoot(containerEl);
    root.render(<CityCards items={items} {...options} />);
    return { unmount: () => root.unmount() };
};
