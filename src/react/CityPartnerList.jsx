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
//  PartnerCategoryList/Card): cityPartners.js decide
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
//
//  showOverview (highlights + pastillas de categoría) — mockup
//  "Destacados + categorías plegadas" acordado con Álvaro, SIEMPRE
//  activo en Verified (ver showHighlights en cityPartners.js, aunque
//  solo haya 1 partner — consistencia visual a propósito): antes de la
//  lista, una franja de partners destacados y una fila de pastillas
//  (icono+nombre+contador) que entran en modo foco al pulsarlas —
//  mismo onEnterFocus que ya usaba el botón "ver todo". highlights
//  llega vacío solo en Parties, que conserva su propio criterio de
//  arranque sin tocar.
// ─────────────────────────────────────────────────────────────

import Card from './Card.jsx';

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

// La card en sí es Card.jsx (layout "compact"): aquí solo se traduce un
// partner a sus slots. Card sanea imageUrl con sanitizeUrl() y, sin imagen
// válida, pinta el monograma con el color de la categoría (mismo patrón
// que .partners-banner-item-logo, home). distanceMeters solo existe si el
// usuario dio permiso de ubicación (ver cityPartners.js,
// getUserLocation()) — sin permiso/soporte, ningún partner lo trae y la
// línea no se renderiza, nunca un "-- m" a medias. Sin coordenadas, no hay
// a dónde llevar — el CTA "Cómo llegar" no se renderiza en vez de apuntar
// a ningún sitio (mismo criterio que "ningún <a> muerto" del proyecto).
function PartnerCard({ partner, group, onSelectPartner, onDirectionsClick }) {
    const hasCoords = partner.lat != null && partner.lng != null;

    return (
        <Card
            layout="compact"
            accent={group.color}
            imageUrl={partner.image_url}
            monogram={initials(partner.name)}
            title={partner.name}
            badge={group.label}
            meta={
                partner.distanceMeters != null
                    ? window.formatDistance(partner.distanceMeters)
                    : undefined
            }
            metaIcon="near_me"
            description={partner.description}
            ctas={[
                hasCoords
                    ? {
                          kind: 'directions',
                          label: I18n.t('map.directions'),
                          href: `https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}`,
                          onClick: () => onDirectionsClick(partner),
                      }
                    : null,
                {
                    kind: 'details',
                    label: I18n.t('home.partners_cta_default'),
                    onClick: (e) => onSelectPartner(partner.id, e.currentTarget),
                },
            ]}
        />
    );
}

export default function CityPartnerList({
    groups,
    highlights,
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
    const visibleGroups = focusCategory
        ? groups.filter((g) => g.category === focusCategory)
        : groups;
    // highlights llega vacío solo en Parties (ver showHighlights en
    // cityPartners.js) — en Verified siempre trae contenido, aunque sea
    // 1 solo destacado. Ocultos en modo foco: son un atajo para
    // explorar, no tienen sentido dentro de "ver todo de esta categoría".
    const showOverview = !focusCategory && highlights.length > 0;

    return (
        <>
            {focusCategory ? (
                <div className="city-partners-focus-bar">
                    <button
                        type="button"
                        className="city-partners-focus-back"
                        onClick={onExitFocus}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            arrow_back
                        </span>
                        {I18n.t('city.partners_back_to_categories')}
                    </button>
                </div>
            ) : null}

            {showOverview ? (
                <section className="city-partners-highlights">
                    <h3 className="city-partners-highlights__heading">
                        <span className="eyebrow eyebrow--primary">
                            {I18n.t('city.partners_highlights_eyebrow')}
                        </span>
                        <span className="city-partners-highlights__title">
                            {I18n.t('city.partners_highlights_title')}
                        </span>
                    </h3>
                    <div className="city-partners-grid">
                        {highlights.map(({ partner, group }) => (
                            <PartnerCard
                                key={partner.id}
                                partner={partner}
                                group={group}
                                onSelectPartner={onSelectPartner}
                                onDirectionsClick={onDirectionsClick}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {showOverview ? (
                <div className="city-partners-category-nav">
                    {groups.map((group) => (
                        <button
                            type="button"
                            key={group.category}
                            className="city-partners-category-pill"
                            style={{ '--cat-color': group.color }}
                            onClick={() => onEnterFocus(group.category)}
                        >
                            <span className="city-partners-category-pill__icon" aria-hidden="true">
                                <span className="material-symbols-outlined">{group.icon}</span>
                            </span>
                            {group.label}
                            <span className="city-partners-category-pill__count">
                                · {group.partners.length}
                            </span>
                        </button>
                    ))}
                </div>
            ) : null}

            {visibleGroups.map((group) => {
                const isFocused = group.category === focusCategory;
                const collapsed =
                    !singleCategory && !isFocused && collapsedCategories.has(group.category);

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
                                <span className="city-partners-group__count">
                                    {group.partners.length}
                                </span>
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
                                        <span className="material-symbols-outlined">
                                            {group.icon}
                                        </span>
                                    </span>
                                    <span className="city-partners-group__label">
                                        {group.label}
                                    </span>
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
