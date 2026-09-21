// ─────────────────────────────────────────────────────────────
//  CityCards.jsx — cards de ciudad (<Card layout="photo">) de
//  ciudades.html y ciudades-todas.html. Recibe `items` con los textos YA
//  resueltos: { name, to, imageUrl?, tag?, meta?, delay? } — no sabe de
//  i18n ni de Supabase. `options`: { arrow, hover ('zoom'|'reveal') }.
//
//  Sin wrapper (Fragment): las cards son hijas directas del grid. El
//  reveal por scroll se engancha en un useEffect, tras el commit real
//  (regla de CLAUDE.md, ver SummaryCardGrid.jsx).
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import Card from './Card.jsx';

export default function CityCards({ items, arrow = false, hover = 'zoom' }) {
    useEffect(() => {
        if (window.initScrollReveal) window.initScrollReveal();
    });

    return (
        <>
            {items.map((item, index) => (
                <Card
                    key={item.to}
                    layout="photo"
                    to={item.to}
                    imageUrl={item.imageUrl}
                    imageAlt={item.name}
                    title={item.name}
                    badge={item.tag}
                    meta={item.meta}
                    arrow={arrow}
                    hover={hover}
                    className={`anim-fade-up anim-delay-${item.delay || (index % 8) + 1}`}
                />
            ))}
        </>
    );
}
