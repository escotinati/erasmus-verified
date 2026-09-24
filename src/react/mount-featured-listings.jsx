// ─────────────────────────────────────────────────────────────
//  mount-featured-listings.jsx — monta <FeaturedListings /> en cada
//  <div data-featured-listings="alojamiento|viaje" [data-animate]>.
//  Auto-monta (como mount-footer.jsx): estas cards no se repintan
//  desde fuera.
// ─────────────────────────────────────────────────────────────

import { createRoot } from 'react-dom/client';
import FeaturedListings from './FeaturedListings.jsx';

document.querySelectorAll('[data-featured-listings]').forEach((el) => {
    createRoot(el).render(
        <FeaturedListings
            kind={el.dataset.featuredListings}
            animate={el.hasAttribute('data-animate')}
        />
    );
});
