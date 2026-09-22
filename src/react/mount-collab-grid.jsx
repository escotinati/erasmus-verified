// ─────────────────────────────────────────────────────────────
//  mount-collab-grid.jsx — monta <CollabGrid /> en cada
//  <div class="card-grid card-grid--tile" data-collab-grid="housing|trips"
//  [data-animate]>. Auto-monta (como mount-footer.jsx): estas cards no
//  se repintan desde fuera. Un root por grid (una página puede tener
//  más de uno).
// ─────────────────────────────────────────────────────────────

import { createRoot } from 'react-dom/client';
import CollabGrid from './CollabGrid.jsx';

document.querySelectorAll('[data-collab-grid]').forEach((el) => {
    createRoot(el).render(
        <CollabGrid set={el.dataset.collabGrid} animate={el.hasAttribute('data-animate')} />
    );
});
