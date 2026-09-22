// ─────────────────────────────────────────────────────────────
//  CollabGrid.jsx — cuadrícula de colaboradores (alojamiento, viajes y
//  la sección de alojamiento del home). Cada colaborador es un <Card>
//  con el layout por defecto (stacked, el mismo que partners/eventos):
//  imagen (placeholder, no hay logo en collabData.js) + título +
//  descripción + un único CTA `offer` (reutiliza `.btn-primary-pill`,
//  mismo estilo que las ofertas de ServiceCards). `rel: '... sponsored'`
//  en el cta mantiene la marca de enlace de afiliado que llevaba el
//  `<a>` cuando la card entera era el enlace (layout="tile").
//
//  Se monta directamente sobre el <div class="card-grid card-grid--stacked">
//  (ver mount-collab-grid.jsx), así que las cards son hijas DIRECTAS del
//  grid — sin wrapper (Fragment), mismo criterio que SummaryCardGrid.
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
                    cta={{
                        kind: 'offer',
                        label: t('services.view_offer_cta', 'Ver oferta'),
                        href: item.href,
                        rel: 'noopener noreferrer sponsored',
                    }}
                    className={animate ? `anim-fade-up anim-delay-${index + 1}` : undefined}
                />
            ))}
        </>
    );
}
