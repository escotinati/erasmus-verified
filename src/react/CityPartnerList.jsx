// ─────────────────────────────────────────────────────────────
//  CityPartnerList.jsx — lista de partners de ciudad.html SIN mapa
//  (isla de React, ver cityPartners.js). Sustituye al mapa embebido +
//  CitySheet: cada categoría es una sección con tarjetas (foto o
//  monograma, nombre, categoría, descripción, "Cómo llegar" directo a
//  Google Maps + botón que abre el mismo Sheet/PartnerDetail.jsx de
//  siempre) — mockup "Ciudad Sin Mapa" acordado con Álvaro antes de
//  esta rama.
//
//  Presentacional puro (sin fetch ni estado propio, como
//  PartnerCategoryList/SummaryCard): cityPartners.js decide
//  collapsedCategories/focusCategory y vuelve a llamar a .render() en
//  cada cambio — este componente solo pinta ese estado.
//
//  CAP: tope de tarjetas visibles por categoría antes de "ver todo".
//  Con muchos partners en una categoría, expandir sin más alargaría la
//  página sin límite — en su lugar, "ver todo" entra en modo foco (ver
//  onEnterFocus): SOLO esa categoría, sin tope, con vuelta atrás. Mismo
//  concepto que activateOnlyCategory ya tenía en mapPartners.js (el
//  buscador de ciudad.js ya "enfocaba" una categoría al elegir un TIPO
//  en vez de un partner concreto), aquí como su propia entrada directa.
//  Categorías con menos partners que el tope nunca muestran el botón
//  "ver todo" (mismo criterio que la Regla 4 de mapPartners.js: sin
//  control para algo que no hace falta controlar).
// ─────────────────────────────────────────────────────────────

const CAP = 6;

function initials(name) {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
}

// Sanea partner.image_url con sanitizeUrl() (global, sanitize.js) antes
// de usarla como src — mismo criterio que PartnerCategoryList.jsx. Sin
// imagen válida, monograma con el color de la categoría en vez de
// hueco/icono roto (mismo patrón que .partners-banner-item-logo, home).
function PartnerCard({ partner, group, onSelectPartner, onDirectionsClick }) {
    const safeImageUrl = window.sanitizeUrl(partner.image_url);
    const hasCoords = partner.lat != null && partner.lng != null;
    const directionsHref = hasCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}`
        : null;

    return (
        <article className="city-partners-card">
            <div className="city-partners-card__top">
                {safeImageUrl ? (
                    <img
                        className="city-partners-card__avatar"
                        src={safeImageUrl}
                        alt=""
                        width="44"
                        height="44"
                    />
                ) : (
                    <div
                        className="city-partners-card__avatar city-partners-card__avatar--monogram"
                        style={{ '--cat-color': group.color }}
                        aria-hidden="true"
                    >
                        {initials(partner.name)}
                    </div>
                )}
                <div className="city-partners-card__heading">
                    <div className="city-partners-card__name">{partner.name}</div>
                    <span className="city-partners-card__cat" style={{ '--cat-color': group.color }}>
                        {group.label}
                    </span>
                </div>
            </div>

            {/* distanceMeters solo existe si el usuario dio permiso de
                ubicación (ver cityPartners.js, getUserLocation()) — sin
                permiso/soporte, ningún partner lo trae y esta línea no
                se renderiza, nunca un "-- m" a medias. */}
            {partner.distanceMeters != null ? (
                <span className="city-partners-card__distance">
                    <span className="material-symbols-outlined" aria-hidden="true">
                        near_me
                    </span>
                    {window.formatDistance(partner.distanceMeters)}
                </span>
            ) : null}

            {partner.description ? <p className="city-partners-card__desc">{partner.description}</p> : null}

            <div className="city-partners-card__actions">
                {/* Sin coordenadas, no hay a dónde llevar — mismo criterio
                    que "ningún <a> muerto" del resto del proyecto: el
                    botón no se renderiza en vez de apuntar a ningún sitio. */}
                {directionsHref ? (
                    <a
                        href={directionsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="city-partners-btn"
                        onClick={() => onDirectionsClick(partner)}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            directions
                        </span>
                        {I18n.t('map.directions')}
                    </a>
                ) : null}
                <button
                    type="button"
                    className="city-partners-btn city-partners-btn--primary"
                    onClick={(e) => onSelectPartner(partner.id, e.currentTarget)}
                >
                    {I18n.t('home.partners_cta_default')}
                </button>
            </div>
        </article>
    );
}

export default function CityPartnerList({
    groups,
    collapsedCategories,
    focusCategory,
    onToggleCollapse,
    onEnterFocus,
    onExitFocus,
    onSelectPartner,
    onDirectionsClick,
}) {
    // Regla 4 (mapPartners.js): una sola categoría con partners → sin
    // control de plegar/desplegar, se muestra siempre entera.
    const singleCategory = groups.length === 1;
    const visibleGroups = focusCategory ? groups.filter((g) => g.category === focusCategory) : groups;

    return (
        <>
            {focusCategory ? (
                <div className="city-partners-focus-bar">
                    <button type="button" className="city-partners-focus-back" onClick={onExitFocus}>
                        <span className="material-symbols-outlined" aria-hidden="true">
                            arrow_back
                        </span>
                        {I18n.t('city.partners_back_to_categories')}
                    </button>
                </div>
            ) : null}

            {visibleGroups.map((group) => {
                const isFocused = group.category === focusCategory;
                const collapsed = !singleCategory && !isFocused && collapsedCategories.has(group.category);

                let visiblePartners;
                if (collapsed) {
                    visiblePartners = [];
                } else if (isFocused) {
                    visiblePartners = group.partners;
                } else {
                    visiblePartners = group.partners.slice(0, CAP);
                }

                const remaining = group.partners.length - CAP;
                const showMore = !isFocused && !collapsed && remaining > 0;

                return (
                    <section
                        key={group.category}
                        className={'city-partners-group' + (collapsed ? ' is-collapsed' : '')}
                        style={{ '--cat-color': group.color }}
                    >
                        {singleCategory ? (
                            <h3 className="city-partners-group__header">
                                <span className="city-partners-group__icon" aria-hidden="true">
                                    <span className="material-symbols-outlined">{group.icon}</span>
                                </span>
                                <span className="city-partners-group__label">{group.label}</span>
                                <span className="city-partners-group__count">{group.partners.length}</span>
                            </h3>
                        ) : (
                            // <h3> envuelve al <button>, no lo sustituye —
                            // mismo motivo que PartnerCategoryList.jsx:
                            // conserva la navegación por encabezados de un
                            // lector de pantalla, el elemento interactivo de
                            // verdad es el <button> de dentro.
                            <h3 className="city-partners-group__heading">
                                <button
                                    type="button"
                                    className="city-partners-group__header"
                                    aria-expanded={!collapsed}
                                    disabled={isFocused}
                                    onClick={() => onToggleCollapse(group.category)}
                                >
                                    <span className="city-partners-group__icon" aria-hidden="true">
                                        <span className="material-symbols-outlined">{group.icon}</span>
                                    </span>
                                    <span className="city-partners-group__label">{group.label}</span>
                                    <span className="city-partners-group__count">
                                        {group.partners.length}
                                    </span>
                                    {!isFocused ? (
                                        <span
                                            className="city-partners-group__chevron material-symbols-outlined"
                                            aria-hidden="true"
                                        >
                                            expand_more
                                        </span>
                                    ) : null}
                                </button>
                            </h3>
                        )}

                        {visiblePartners.length > 0 ? (
                            <div className="city-partners-grid">
                                {visiblePartners.map((partner) => (
                                    <PartnerCard
                                        key={partner.id}
                                        partner={partner}
                                        group={group}
                                        onSelectPartner={onSelectPartner}
                                        onDirectionsClick={onDirectionsClick}
                                    />
                                ))}
                            </div>
                        ) : null}

                        {showMore ? (
                            <button
                                type="button"
                                className="city-partners-more"
                                onClick={() => onEnterFocus(group.category)}
                            >
                                {I18n.t('city.partners_more_cta')} {group.label} (+{remaining})
                            </button>
                        ) : null}
                    </section>
                );
            })}
        </>
    );
}
