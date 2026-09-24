// ─────────────────────────────────────────────────────────────
//  FeaturedListings.jsx — cards de alojamientos.html/viajes.html
//  (el listado de TODOS) que enlazan a la ficha individual de UNO en
//  concreto (alojamiento.html/viaje.html?id=ID — ver ListingDetail.jsx).
//
//  Distinto de CollabGrid.jsx: esas cards saltan directamente a la web
//  externa del colaborador (Uniplaces, FlixBus...), CTA "external"; estas
//  se quedan dentro de la web, CTA "offer" (botón relleno, mismo peso
//  visual que "Ver oferta" — a propósito: esta sección va PRIMERO en la
//  página y es el camino principal, ver alojamientos.html/viajes.html).
//
//  Filtro de texto: en memoria, sin red (LISTINGS[kind] tiene 4
//  entradas hoy) — normalize() quita acentos/mayúsculas, mismo criterio
//  que el filtro de ciudades-todas.html. El root incluye la barra de
//  filtro Y la rejilla en el mismo árbol de React (a diferencia de
//  CollabGrid.jsx, que solo pinta cards) porque ambas comparten el
//  estado `query` — ver mount-featured-listings.jsx.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import Card from './Card.jsx';
import { LISTINGS } from './listingsData.js';
import { t } from './navShared.jsx';

function normalize(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export default function FeaturedListings({ kind, animate = true }) {
    const items = LISTINGS[kind] || [];
    const [query, setQuery] = useState('');
    const nq = normalize(query);
    // Busca en título Y ubicación (zona en alojamiento, punto de salida/
    // destino en viaje) — el placeholder promete "nombre o zona"/"destino",
    // así que solo mirar el título se queda corto: "Barcelona" no
    // aparece en el título de "Estudio en Gràcia", pero sí en su
    // location ("Gràcia, Barcelona"). Cada kind ya trae el campo
    // adecuado en sus propios datos (listingsData.js), así que este
    // mismo filtro es "consecuente" con lo que se está mirando sin
    // necesitar lógica distinta por kind.
    const filtered = nq
        ? items.filter((item) => normalize(`${item.title} ${item.location}`).includes(nq))
        : items;

    // Mismo motivo que SummaryCardGrid.jsx: el reveal se engancha
    // DESPUÉS del commit real de React, dentro del propio componente.
    // También debe repetirse en cada filtrado: las cards que reaparecen
    // tras borrar una letra ya tenían la clase anim-fade-up puesta pero
    // el observer nunca las vio entrar (estaban desmontadas), así que
    // sin esto se quedarían en opacity:0 para siempre.
    useEffect(() => {
        if (animate && window.initScrollReveal) window.initScrollReveal();
    });

    const placeholder = t(
        `listing.search_placeholder_${kind}`,
        kind === 'alojamiento' ? 'Busca por nombre o zona…' : 'Busca por destino…'
    );

    return (
        <>
            <div className="featured-filter">
                <div className="featured-filter-bar">
                    <span className="material-symbols-outlined" aria-hidden="true">
                        search
                    </span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        aria-label={placeholder}
                        autoComplete="off"
                    />
                    {query ? (
                        <button
                            type="button"
                            className="featured-filter-clear"
                            onClick={() => setQuery('')}
                            aria-label={t('common.close', 'Cerrar')}
                        >
                            <span className="material-symbols-outlined" aria-hidden="true">
                                close
                            </span>
                        </button>
                    ) : null}
                </div>
                <span className="featured-filter-count" aria-live="polite">
                    {filtered.length} / {items.length}
                </span>
            </div>

            {filtered.length > 0 ? (
                <div className="events-scroll">
                    {filtered.map((item, index) => (
                        <Card
                            key={item.id}
                            title={item.title}
                            price={`${item.price} ${item.priceUnit}`}
                            description={item.description}
                            cta={{
                                kind: 'offer',
                                label: t('listing.view_listing_cta', 'Ver ficha'),
                                to: `${kind}.html?id=${item.id}`,
                            }}
                            className={animate ? `anim-fade-up anim-delay-${index + 1}` : undefined}
                        />
                    ))}
                </div>
            ) : (
                <div className="featured-filter-empty">
                    <span className="material-symbols-outlined" aria-hidden="true">
                        search_off
                    </span>
                    <p>{t('listing.filter_no_results', 'No hay resultados para tu búsqueda.')}</p>
                </div>
            )}
        </>
    );
}
