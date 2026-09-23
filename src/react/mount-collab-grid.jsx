// ─────────────────────────────────────────────────────────────
//  mount-collab-grid.jsx — monta <CollabGrid /> en cada
//  <div data-collab-grid="housing|trips" [data-animate] [data-cta-kind]>.
//  Auto-monta (como mount-footer.jsx): estas cards no se repintan desde
//  fuera. Un root por grid (una página puede tener más de uno).
//  `data-cta-kind` es opcional (por defecto 'offer' — ver CollabGrid.jsx);
//  alojamiento.html pasa "tickets".
// ─────────────────────────────────────────────────────────────

import { createRoot } from 'react-dom/client';
import CollabGrid from './CollabGrid.jsx';

document.querySelectorAll('[data-collab-grid]').forEach((el) => {
    createRoot(el).render(
        <CollabGrid
            set={el.dataset.collabGrid}
            animate={el.hasAttribute('data-animate')}
            ctaKind={el.dataset.ctaKind}
        />
    );
});
