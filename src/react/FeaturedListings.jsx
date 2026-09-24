// ─────────────────────────────────────────────────────────────
//  FeaturedListings.jsx — cards de alojamientos.html/viajes.html
//  (el listado de TODOS) que enlazan a la ficha individual de UNO en
//  concreto (alojamiento.html/viaje.html?id=ID — ver ListingDetail.jsx).
//
//  Distinto de CollabGrid.jsx: esas cards saltan directamente a la web
//  externa del colaborador (Uniplaces, FlixBus...); estas se quedan
//  dentro de la web y llevan a la ficha propia — el punto de entrada
//  que le faltaba a la ficha individual (hasta ahora solo se llegaba
//  tecleando la URL a mano o desde "más similares" de otra ficha).
//
//  Reutiliza LISTINGS de listingsData.js (mismo array de ejemplo que
//  ListingDetail.jsx — ver el comentario de cabecera de ese archivo
//  sobre por qué es provisional) y el layout por defecto de Card.jsx
//  (`stacked`, el mismo que partners/eventos del home) con CTA `link`
//  (texto + chevron, `to` interno) en vez de `offer`/`tickets`
//  (`href` externo) — la propia CTA ya deja claro que el destino es
//  interno.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import Card from './Card.jsx';
import { LISTINGS } from './listingsData.js';
import { t } from './navShared.jsx';

export default function FeaturedListings({ kind }) {
    const items = LISTINGS[kind] || [];

    // Mismo motivo que SummaryCardGrid.jsx: el reveal se engancha
    // DESPUÉS del commit real de React, dentro del propio componente.
    useEffect(() => {
        if (window.initScrollReveal) window.initScrollReveal();
    });

    return (
        <>
            {items.map((item, index) => (
                <Card
                    key={item.id}
                    title={item.title}
                    price={`${item.price} ${item.priceUnit}`}
                    description={item.description}
                    cta={{
                        kind: 'link',
                        label: t('listing.view_listing_cta', 'Ver ficha'),
                        to: `${kind}.html?id=${item.id}`,
                    }}
                    className={`anim-fade-up anim-delay-${index + 1}`}
                />
            ))}
        </>
    );
}
