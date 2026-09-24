// ─────────────────────────────────────────────────────────────
//  CollabGrid.jsx — cuadrícula de colaboradores (alojamiento, viajes y
//  la sección de alojamiento del home). Cada colaborador es un <Card>
//  con el layout por defecto (stacked, el mismo que partners/eventos):
//  imagen (placeholder, no hay logo en collabData.js) + título +
//  descripción + un único CTA. `rel: '... sponsored'` en el cta
//  mantiene la marca de enlace de afiliado que llevaba el `<a>` cuando
//  la card entera era el enlace (layout="tile").
//
//  CTA "external" (a propósito, siempre — estos colaboradores SIEMPRE
//  saltan a la web de otra empresa, nunca a una página propia): botón
//  secundario con borde e icono open_in_new, más discreto que
//  .btn-primary-pill — igual que el badge "Enlace externo" y el fondo
//  ligeramente teñido (.card--external), es una distinción visual
//  deliberada frente a las cards de ficha propia (FeaturedListings.jsx,
//  CTA "offer"), a petición explícita de Álvaro. Antes existía un
//  `ctaKind` configurable por página (alojamiento.html pedía 'tickets')
//  — se retiró: da igual la página, un colaborador externo siempre es
//  "external".
//
//  Se monta directamente sobre el contenedor del grid (ver
//  mount-collab-grid.jsx), así que las cards son hijas DIRECTAS de ese
//  contenedor — sin wrapper (Fragment), mismo criterio que SummaryCardGrid.
//
//  El texto llega por t() (I18n) al renderizar, no por data-i18n +
//  applyTranslations(): mismo motivo que Nav/Footer (regla de
//  DOMContentLoaded en CLAUDE.md).
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import Card from './Card.jsx';
import { COLLAB_SETS } from './collabData.js';
import { t } from './navShared.jsx';

export default function CollabGrid({ set, animate }) {
    const items = COLLAB_SETS[set] || [];

    // Mismo motivo que SummaryCardGrid.jsx: el reveal se engancha DESPUÉS
    // del commit real de React, dentro del propio componente.
    useEffect(() => {
        if (animate && window.initScrollReveal) window.initScrollReveal();
    });

    return (
        <>
            {items.map((item, index) => (
                <Card
                    key={item.name}
                    title={item.name}
                    description={t(item.descKey, item.fallback)}
                    badge={t('listing.external_badge', 'Enlace externo')}
                    cta={{
                        kind: 'external',
                        label: t('services.view_offer_cta', 'Ver oferta'),
                        href: item.href,
                        rel: 'noopener noreferrer sponsored',
                    }}
                    className={`card--external${animate ? ` anim-fade-up anim-delay-${index + 1}` : ''}`}
                />
            ))}
        </>
    );
}
