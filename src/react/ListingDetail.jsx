// ─────────────────────────────────────────────────────────────
//  ListingDetail.jsx — ficha individual de un alojamiento o un viaje
//  (alojamiento.html / viaje.html), diseño unificado para los dos
//  (mockup aprobado por Álvaro — ver el canvas de diseño). No
//  confundir con alojamientos.html/viajes.html (listado de TODOS),
//  ver la nota de nomenclatura en CLAUDE.md.
//
//  TODA ficha está gestionada directamente por Erasmus Verified — sin
//  distinción de terceros (decisión explícita de Álvaro: se retiró el
//  `linkType` 'interno'/'externo' que existía antes, junto con la
//  sección "Plataformas colaboradoras"/CollabGrid.jsx de
//  alojamientos.html/viajes.html). El CTA principal es siempre
//  "Solicitar información", SIN destino funcional todavía (pendiente de
//  decidir con Álvaro qué pasa al pulsarlo — formulario, WhatsApp... de
//  momento es solo visual, ver CLAUDE.md).
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

import { useEffect, useState } from 'react';
import { LISTINGS } from './listingsData.js';
import { t } from './navShared.jsx';
import ListingGalleryLightbox from './ListingGalleryLightbox.jsx';

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
    // null = cerrado; el índice de la foto activa mientras está abierto.
    // No hace falta resetearlo al cambiar de ficha: cada ?id= distinto
    // es una navegación de página completa (sin router), así que este
    // componente se vuelve a montar desde cero.
    const [lightboxIndex, setLightboxIndex] = useState(null);

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
    // "Erasmus Verified" no se traduce (nombre de marca), solo el prefijo.
    const metaSourceLabel = `${t('listing.organized_by_prefix', 'Organizado por')} Erasmus Verified`;
    const priceCaption = t(
        'listing.managed_by_verified',
        'Gestionado directamente por Erasmus Verified'
    );
    // Al menos 1 aunque el dato viniera vacío/negativo — la galería
    // siempre tiene algo que mostrar. Con 2 fotos no hay "+N" (no
    // queda ninguna más por ver); con 1 no hay ni miniatura.
    const photoCount = Math.max(listing.photoCount || 1, 1);
    const morePhotosCount = Math.max(photoCount - 2, 0);
    const galleryLabel = t('listing.gallery_open', 'Abrir galería de fotos');

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
                <button
                    type="button"
                    className="listing-gallery-main"
                    onClick={() => setLightboxIndex(0)}
                    aria-label={galleryLabel}
                ></button>
                {photoCount > 1 ? (
                    <div className="listing-gallery-side">
                        <button
                            type="button"
                            className="listing-gallery-thumb"
                            onClick={() => setLightboxIndex(1)}
                            aria-label={galleryLabel}
                        ></button>
                        {morePhotosCount > 0 ? (
                            <button
                                type="button"
                                className="listing-gallery-thumb listing-gallery-thumb--more"
                                onClick={() => setLightboxIndex(2)}
                                aria-label={galleryLabel}
                            >
                                <span>+{morePhotosCount}</span>
                            </button>
                        ) : null}
                    </div>
                ) : null}
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
                        <span className="listing-badge listing-badge--direct">
                            <span className="material-symbols-outlined" aria-hidden="true">
                                handshake
                            </span>
                            {t('listing.direct_badge', 'Reserva directa')}
                        </span>
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

                    <button type="button" className="btn-primary-pill listing-cta-primary">
                        {t('listing.request_info_cta', 'Solicitar información')}
                    </button>
                    <button type="button" className="listing-cta-secondary">
                        {t('listing.view_availability_cta', 'Ver disponibilidad')}
                    </button>

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

            {lightboxIndex !== null ? (
                <ListingGalleryLightbox
                    photoCount={photoCount}
                    activeIndex={lightboxIndex}
                    onNavigate={setLightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                />
            ) : null}
        </div>
    );
}
