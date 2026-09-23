// ─────────────────────────────────────────────────────────────
//  ServiceCards.jsx — cards de servicios (<Card>, layout por defecto
//  "stacked" — mismo layout que partners/eventos/colaboradores, unificado
//  a petición explícita para que se comporten igual que las cards de
//  index.html; sin foto real, así que usan el fallback de `icon` de
//  Card.jsx en vez de imageUrl). Usado por servicios.html (datos de
//  servicesData.js, resueltos con t() en mount-service-cards.jsx) y por
//  ciudad.js (escapadas de la ciudad, datos de Supabase). Recibe `items`
//  con los textos YA resueltos: { icon, name, highlight?, description,
//  ctaLabel?, ctaHref? | ctaTo?, delay? } — este componente no sabe de
//  i18n ni de Supabase. `highlight` se pasa como `price` (mismo slot que
//  usan las cards de evento del home para "Gratis con lista"/"10€").
//
//  Sin wrapper (Fragment): las cards son hijas directas del grid. El
//  reveal por scroll se engancha en un useEffect, tras el commit real
//  (regla de CLAUDE.md, ver SummaryCardGrid.jsx).
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import Card from './Card.jsx';

export default function ServiceCards({ items, animate = true }) {
    useEffect(() => {
        if (animate && window.initScrollReveal) window.initScrollReveal();
    });

    return (
        <>
            {items.map((item, index) => (
                <Card
                    key={item.name + index}
                    icon={item.icon}
                    title={item.name}
                    price={item.highlight}
                    description={item.description}
                    cta={
                        item.ctaTo
                            ? { kind: 'link', label: item.ctaLabel, to: item.ctaTo }
                            : item.ctaHref
                              ? { kind: 'offer', label: item.ctaLabel, href: item.ctaHref }
                              : undefined
                    }
                    className={
                        animate
                            ? `anim-fade-up anim-delay-${item.delay || (index % 8) + 1}`
                            : undefined
                    }
                />
            ))}
        </>
    );
}
