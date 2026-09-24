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
//  Filtros: todo en memoria, sin red (LISTINGS[kind] tiene 4 entradas
//  hoy) — texto libre (normalize() quita acentos/mayúsculas, mismo
//  criterio que el filtro de ciudades-todas.html, sobre título +
//  ubicación + quién publica + descripción: "todos los campos" que tiene
//  una ficha, no solo el título) + tipo (`linkType`: interno/externo,
//  mismo campo que decide el CTA en ListingDetail.jsx) + orden por
//  precio (asc/desc, parseado de `item.price` con priceValue()). El
//  root incluye la barra de filtros Y la rejilla en el mismo árbol de
//  React (a diferencia de CollabGrid.jsx, que solo pinta cards) porque
//  comparten estado — ver mount-featured-listings.jsx.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import Card from './Card.jsx';
import { LISTINGS } from './listingsData.js';
import { t } from './navShared.jsx';

function normalize(str) {
    return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Precio como número para poder ordenar — listingsData.js lo guarda como
// texto ("450 €", "18 €") porque es lo que se muestra tal cual en la
// card/ficha; aquí solo hace falta el primer número que aparezca.
function priceValue(item) {
    const match = (item.price || '').match(/\d+([.,]\d+)?/);
    return match ? parseFloat(match[0].replace(',', '.')) : 0;
}

export default function FeaturedListings({ kind, animate = true }) {
    const items = LISTINGS[kind] || [];
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');
    const nq = normalize(query);
    // Busca en TODOS los campos de texto relevantes de la ficha (título,
    // ubicación, quién la publica y la descripción) — no solo el título:
    // el placeholder promete "nombre o zona"/"destino", y "Barcelona" no
    // aparece en el título de "Estudio en Gràcia" pero sí en su location
    // ("Gràcia, Barcelona"); "Uniplaces" no aparece en ningún título pero
    // sí en su `source`. Cada kind ya trae los mismos campos en sus datos
    // (listingsData.js), así que este mismo filtro es "consecuente" con
    // lo que se está mirando sin necesitar lógica distinta por kind.
    const searched = nq
        ? items.filter((item) =>
              normalize(
                  `${item.title} ${item.location} ${item.source} ${item.description}`
              ).includes(nq)
          )
        : items;
    // Tipo de ficha: 'interno' (gestionado por Erasmus Verified/particular,
    // sin CTA externo todavía) vs 'externo' (redirige a la web de quien la
    // publica) — mismo campo `linkType` que decide el CTA en ListingDetail.jsx.
    const byType = typeFilter ? searched.filter((item) => item.linkType === typeFilter) : searched;
    // Ordenar por precio es opcional (select con "Más relevantes" por
    // defecto = orden original de listingsData.js); .slice() antes de
    // .sort() porque Array.prototype.sort muta el array in-place.
    const filtered = sortOrder
        ? byType
              .slice()
              .sort((a, b) =>
                  sortOrder === 'asc'
                      ? priceValue(a) - priceValue(b)
                      : priceValue(b) - priceValue(a)
              )
        : byType;

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

    const typeLabel = t('listing.filter_type_label', 'Filtrar por tipo');
    const sortLabel = t('listing.filter_sort_label', 'Ordenar por precio');

    return (
        <>
            <div className="featured-filter">
                <div className="featured-filter-row">
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

                    <select
                        className="featured-filter-select"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        aria-label={typeLabel}
                    >
                        <option value="">{t('listing.filter_type_all', 'Todos los tipos')}</option>
                        <option value="interno">
                            {t('listing.filter_type_internal', 'Gestionado por Erasmus Verified')}
                        </option>
                        <option value="externo">
                            {t('listing.filter_type_external', 'Enlace externo')}
                        </option>
                    </select>

                    <select
                        className="featured-filter-select"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        aria-label={sortLabel}
                    >
                        <option value="">
                            {t('listing.filter_sort_default', 'Más relevantes')}
                        </option>
                        <option value="asc">
                            {t('listing.filter_sort_price_asc', 'Precio: menor a mayor')}
                        </option>
                        <option value="desc">
                            {t('listing.filter_sort_price_desc', 'Precio: mayor a menor')}
                        </option>
                    </select>
                </div>
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
