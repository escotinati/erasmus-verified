// ─────────────────────────────────────────────────────────────
//  ListingDetail.jsx — ficha individual de un alojamiento o un viaje
//  (alojamiento.html / viaje.html), diseño unificado para los dos
//  (mockup aprobado por Álvaro — ver el canvas de diseño). No
//  confundir con alojamientos.html/viajes.html (listado de TODOS),
//  ver la nota de nomenclatura en CLAUDE.md.
//
//  El elemento que distingue cada ficha es `linkType`:
//    'externo' — el colaborador tiene su propia web (Uniplaces,
//                FlixBus...); el CTA principal es "Ver oferta" y abre
//                esa web en pestaña nueva, igual que el resto de CTAs
//                externos del proyecto (Card.jsx, CollabGrid.jsx).
//    'interno' — la reserva la gestiona Erasmus Verified directamente;
//                el CTA principal es "Solicitar información", SIN
//                destino funcional todavía (pendiente de decidir con
//                Álvaro qué pasa al pulsarlo — formulario, WhatsApp...
//                de momento es solo visual, ver CLAUDE.md).
//  Ambos casos comparten el resto de la estructura: galería, badge de
//  verificado, meta, descripción, características y "más similares".
//
//  Datos: `LISTINGS` (listingsData.js) es un array de ejemplo en
//  memoria — sustituye a una tabla de Supabase que todavía no existe
//  (ver el comentario de cabecera de ese archivo). El id activo se lee
//  de `?id=` en la URL, no de `?alojamiento=`/`?viaje=`, a propósito
//  (mismo criterio que llevó a renombrar alojamiento.html a
//  alojamientos.html: evitar repetir la ambigüedad singular/plural en
//  la propia URL).
//
//  Presentacional pero con una responsabilidad más que Card.jsx: lee
//  `window.location.search` directamente (mismo criterio que Nav.jsx
//  leyendo window.ERASMUS_EXPERIENCE al renderizar, sin
//  DOMContentLoaded — ver la regla de arquitectura de Navegación en
//  CLAUDE.md) porque esta isla no tiene script clásico propio que se
//  lo resuelva antes.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { LISTINGS } from './listingsData.js';
import { t } from './navShared.jsx';

function getIdFromUrl() {
    const raw = new URLSearchParams(window.location.search).get('id');
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
}

export default function ListingDetail({ kind }) {
    const items = LISTINGS[kind] || [];
    const activeId = getIdFromUrl();
    // Sin ?id= en absoluto: se muestra la primera ficha como entrada de
    // demostración. Con ?id= presente pero que no casa con ninguna
    // (enlace roto, id borrado...): NO se sustituye por la primera en
    // silencio — eso engañaría al usuario haciéndole creer que es la
    // ficha que buscaba — se cae al estado "no encontrado" de abajo.
    const listing =
        activeId === null ? items[0] || null : items.find((item) => item.id === activeId) || null;

    // Mismo motivo que SummaryCardGrid.jsx: el reveal se engancha
    // DESPUÉS del commit real de React, dentro del propio componente.
    useEffect(() => {
        if (window.initScrollReveal) window.initScrollReveal();
    }, [listing]);

    // Sin script clásico propio que lo resuelva desde fuera (a
    // diferencia de ciudad.js con document.title para ciudad.html):
    // el título de pestaña de una ficha compartible/marcable tiene que
    // reflejar SU contenido, no quedarse en el <title> estático del HTML.
    useEffect(() => {
        if (listing) document.title = `${listing.title} — Erasmus Verified`;
    }, [listing]);

    const listingBackHref = kind === 'alojamiento' ? 'alojamientos.html' : 'viajes.html';

    if (!listing) {
        return (
            <div className="listing-empty anim-fade-up">
                <span className="material-symbols-outlined" aria-hidden="true">
                    search_off
                </span>
                <h1>{t('listing.not_found_title', 'No hemos encontrado esta ficha')}</h1>
                <p>
                    {t(
                        'listing.not_found_body',
                        'Puede que el enlace esté roto o que ya no esté disponible.'
                    )}
                </p>
                <a className="btn-primary-pill" href={listingBackHref}>
                    {t(
                        kind === 'alojamiento'
                            ? 'listing.back_to_alojamientos'
                            : 'listing.back_to_viajes',
                        'Ver todos'
                    )}
                </a>
            </div>
        );
    }

    const isExterno = listing.linkType === 'externo';
    const related = items.filter((item) => item.id !== listing.id).slice(0, 3);
    const breadcrumbLabel = t(
        kind === 'alojamiento' ? 'nav.accommodation' : 'nav.trips',
        kind === 'alojamiento' ? 'Alojamiento' : 'Viajes'
    );
    const featuresTitle = t(
        `listing.features_title_${kind}`,
        kind === 'alojamiento' ? 'Qué incluye este alojamiento' : 'Qué incluye este viaje'
    );
    const relatedTitle = t(
        `listing.related_${kind}`,
        kind === 'alojamiento' ? 'Más alojamientos similares' : 'Más viajes similares'
    );
    const metaSourceLabel = isExterno
        ? `${t('listing.via_prefix', 'Vía')} ${listing.source}`
        : `${t('listing.organized_by_prefix', 'Organizado por')} ${listing.source}`;
    const priceCaption = isExterno
        ? `${t('listing.opens_on_prefix', 'Se abre en la web de')} ${listing.source}`
        : t('listing.managed_by_verified', 'Gestionado directamente por Erasmus Verified');
    // Sanea igual que Card.jsx (CardCta): mismo hábito, útil desde ya
    // aunque hoy sea un array en memoria, para no tener que acordarse
    // el día que ctaHref venga de Supabase/admin de verdad.
    const safeCtaHref = isExterno ? window.sanitizeUrl(listing.ctaHref) : null;

    return (
        <div className="listing-detail">
            <div className="listing-breadcrumb">
                <a href={listingBackHref}>{breadcrumbLabel}</a>
                <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_right
                </span>
                <span className="listing-breadcrumb-current">{listing.title}</span>
            </div>

            <div className="listing-gallery anim-fade-up">
                <div className="listing-gallery-main"></div>
                <div className="listing-gallery-side">
                    <div className="listing-gallery-thumb"></div>
                    <div className="listing-gallery-thumb listing-gallery-thumb--more">
                        <span>+8</span>
                    </div>
                </div>
            </div>

            <div className="listing-layout">
                <div className="listing-main anim-fade-up anim-delay-1">
                    <div className="listing-badges">
                        <span className="listing-badge listing-badge--verified">
                            <span className="material-symbols-outlined" aria-hidden="true">
                                verified
                            </span>
                            {t('listing.verified_badge', 'Verificado por Erasmus')}
                        </span>
                        {isExterno ? (
                            <span className="listing-badge listing-badge--external">
                                <span className="material-symbols-outlined" aria-hidden="true">
                                    open_in_new
                                </span>
                                {t('listing.external_badge', 'Enlace externo')}
                            </span>
                        ) : (
                            <span className="listing-badge listing-badge--direct">
                                <span className="material-symbols-outlined" aria-hidden="true">
                                    handshake
                                </span>
                                {t('listing.direct_badge', 'Reserva directa')}
                            </span>
                        )}
                    </div>

                    <h1 className="listing-title">{listing.title}</h1>

                    <div className="listing-meta">
                        <span className="material-symbols-outlined" aria-hidden="true">
                            {kind === 'alojamiento' ? 'location_on' : 'flight'}
                        </span>
                        <span>{listing.location}</span>
                        <span className="listing-meta-dot">·</span>
                        <span>{metaSourceLabel}</span>
                    </div>

                    <p className="listing-desc">{listing.description}</p>

                    <div className="listing-features">
                        <h2>{featuresTitle}</h2>
                        <div className="listing-features-grid">
                            {listing.features.map((f) => (
                                <div className="listing-feature-item" key={f.icon}>
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        {f.icon}
                                    </span>
                                    <span>{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="listing-price-card anim-fade-up anim-delay-2">
                    <div className="listing-price-row">
                        <span className="listing-price">{listing.price}</span>
                        <span className="listing-price-unit">{listing.priceUnit}</span>
                    </div>
                    <p className="listing-price-caption">{priceCaption}</p>

                    {isExterno ? (
                        <a
                            className="btn-primary-pill listing-cta-primary"
                            href={safeCtaHref || undefined}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                        >
                            {t('services.view_offer_cta', 'Ver oferta')}
                            <span className="material-symbols-outlined" aria-hidden="true">
                                arrow_forward
                            </span>
                        </a>
                    ) : (
                        <>
                            <button type="button" className="btn-primary-pill listing-cta-primary">
                                {t('listing.request_info_cta', 'Solicitar información')}
                            </button>
                            <button type="button" className="listing-cta-secondary">
                                {t('listing.view_availability_cta', 'Ver disponibilidad')}
                            </button>
                        </>
                    )}

                    <div className="listing-trust">
                        <div className="listing-trust-item">
                            <span className="material-symbols-outlined" aria-hidden="true">
                                check_circle
                            </span>
                            {t('listing.no_hidden_fees', 'Sin comisiones ocultas')}
                        </div>
                        <div className="listing-trust-item">
                            <span className="material-symbols-outlined" aria-hidden="true">
                                check_circle
                            </span>
                            {t('listing.secure_payment', 'Pago seguro')}
                        </div>
                    </div>
                </aside>
            </div>

            {related.length > 0 ? (
                <div className="listing-related anim-fade-up anim-delay-3">
                    <h2>{relatedTitle}</h2>
                    <div className="events-scroll">
                        {related.map((item) => (
                            <a
                                key={item.id}
                                className="card listing-related-card"
                                href={`${kind}.html?id=${item.id}`}
                            >
                                <div className="card__media">
                                    <div className="card-img-placeholder"></div>
                                </div>
                                <div className="card__body">
                                    <h3 className="card__title">{item.title}</h3>
                                    <p className="card__price">
                                        {item.price} {item.priceUnit}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
