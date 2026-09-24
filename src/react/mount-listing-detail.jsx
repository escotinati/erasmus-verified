// ─────────────────────────────────────────────────────────────
//  mount-listing-detail.jsx — monta <ListingDetail /> sobre
//  <div id="listing-detail-root" data-listing-kind="alojamiento|viaje">.
//  Auto-monta una única vez (como mount-footer.jsx): esta ficha no se
//  repinta desde fuera, cada navegación (?id=) recarga la página.
// ─────────────────────────────────────────────────────────────

import { createRoot } from 'react-dom/client';
import ListingDetail from './ListingDetail.jsx';

const root = document.getElementById('listing-detail-root');
if (root) {
    createRoot(root).render(<ListingDetail kind={root.dataset.listingKind} />);
}
