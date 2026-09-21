// ─────────────────────────────────────────────────────────────
//  Card.jsx — la card única de la web (familia de cards).
//  Sustituye a SummaryCard.jsx y al PartnerCard de CityPartnerList.jsx.
//
//  Una sola estructura con slots OPCIONALES — cada tipo de card
//  (anunciante de partner, evento, partner de ciudad, y en fases
//  futuras alojamiento, servicio, ciudad…) es una combinación de
//  slots, no un componente aparte. Un slot sin valor no se renderiza.
//
//    media/avatar imageUrl (+ imageAlt) · monogram · badge
//    body         title · meta (+ metaIcon) · date · price · description
//    ctas         [{ kind, label, href?, onClick? }]  (o `cta` suelto)
//    href / rel   (solo layout 'tile') la card ENTERA es el enlace
//
//  LAYOUTS (prop `layout`):
//    'stacked'  (defecto) imagen 4:3 arriba + cuerpo. Home.
//    'compact'  avatar de 44px junto al título, con borde, sin imagen a
//               sangre. Lista de partners de ciudad.html. `accent`
//               (color CSS) tiñe el badge, el monograma y el hover.
//    'tile'     nombre + descripción centrados; toda la card es un <a>
//               (`href`, `rel`), sin CTA. Colaboradores (CollabGrid).
//
//  CTA_KINDS es el ÚNICO sitio donde se define qué es cada tipo de
//  botón (icono). Su estilo vive en card.css (.card-cta--<kind>). Un
//  CTA con `href` es un <a>; sin `href` pero con `onClick`, un <button>.
//  Añadir un tipo nuevo = una entrada aquí + su modificador en card.css.
//
//  Presentacional puro: sin fetch ni estado. Todo el texto llega ya
//  traducido; imageUrl/cta.href se sanean aquí con sanitizeUrl()
//  (global, src/js/utils/sanitize.js) antes de usarlos en src/href.
// ─────────────────────────────────────────────────────────────

const CTA_KINDS = {
    // Más información: enlace de texto, se revela en hover en punteros finos.
    info: { icon: null },
    // Comprar entrada / ver evento: botón relleno, siempre visible.
    tickets: { icon: 'arrow_forward' },
    // Cómo llegar: botón secundario con borde (enlace a Google Maps).
    directions: { icon: 'directions' },
    // Ver detalle: botón primario que abre el Sheet (sin href, con onClick).
    details: { icon: null },
};

function CardCta({ kind = 'info', label, href, onClick }) {
    const { icon } = CTA_KINDS[kind] || CTA_KINDS.info;
    const className = `card-cta card-cta--${kind}`;
    const content = (
        <>
            {icon && kind === 'directions' ? (
                <span className="material-symbols-outlined" aria-hidden="true">
                    {icon}
                </span>
            ) : null}
            <span>{label}</span>
            {icon && kind !== 'directions' ? (
                <span className="material-symbols-outlined">{icon}</span>
            ) : null}
        </>
    );

    if (href) {
        const safeHref = window.sanitizeUrl(href);
        if (!safeHref) return null;
        return (
            <a
                className={className}
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClick}
            >
                {content}
            </a>
        );
    }
    if (onClick) {
        return (
            <button type="button" className={className} onClick={onClick}>
                {content}
            </button>
        );
    }
    return null;
}

function CardFooter({ ctas }) {
    const items = ctas.filter(Boolean);
    if (items.length === 0) return null;
    const modifier = items.length > 1 ? 'actions' : items[0].kind || 'info';

    return (
        <div className={`card__footer card__footer--${modifier}`}>
            {items.map((cta, i) => (
                <CardCta key={cta.kind + i} {...cta} />
            ))}
        </div>
    );
}

export default function Card({
    layout = 'stacked',
    accent,
    imageUrl,
    imageAlt = '',
    monogram,
    badge,
    title,
    meta,
    metaIcon = 'location_on',
    date,
    price,
    description,
    cta,
    ctas,
    href,
    rel,
    className,
}) {
    const safeImageUrl = window.sanitizeUrl(imageUrl);
    const footer = <CardFooter ctas={ctas || (cta ? [cta] : [])} />;
    const metaEl = meta ? (
        <p className="card__meta">
            <span className="material-symbols-outlined" aria-hidden="true">
                {metaIcon}
            </span>
            <span>{meta}</span>
        </p>
    ) : null;
    const descEl = description ? <p className="card__desc">{description}</p> : null;
    const style = accent ? { '--cat-color': accent } : undefined;

    if (layout === 'tile') {
        const safeHref = window.sanitizeUrl(href);
        // Sin URL válida no hay a dónde llevar: no se renderiza la card
        // (mismo criterio que "ningún <a> muerto" del resto del proyecto).
        if (!safeHref) return null;
        return (
            <a
                className={`card card--tile ${className || ''}`.trim()}
                href={safeHref}
                target="_blank"
                rel={rel || 'noopener noreferrer'}
            >
                <span className="card__title">{title}</span>
                {/* Espacio real entre nombre y descripción: los dos son items
                    flex (sin efecto visual), pero el nombre accesible del
                    enlace y el texto copiado no salen pegados. */}{' '}
                {description ? <span className="card__desc">{description}</span> : null}
            </a>
        );
    }

    if (layout === 'compact') {
        return (
            <article className={`card card--compact ${className || ''}`.trim()} style={style}>
                <div className="card__head">
                    {safeImageUrl ? (
                        <img
                            className="card__avatar"
                            src={safeImageUrl}
                            alt={imageAlt}
                            width="44"
                            height="44"
                        />
                    ) : monogram ? (
                        <div className="card__avatar card__avatar--monogram" aria-hidden="true">
                            {monogram}
                        </div>
                    ) : null}
                    <div className="card__heading">
                        <h4 className="card__title">{title}</h4>
                        {badge ? <span className="card__badge">{badge}</span> : null}
                    </div>
                </div>
                {metaEl}
                {descEl}
                {footer}
            </article>
        );
    }

    return (
        <div className={`card ${className || ''}`.trim()} style={style}>
            <div className="card__media">
                {safeImageUrl ? (
                    <img src={safeImageUrl} alt={imageAlt} loading="lazy" />
                ) : (
                    <div className="card-img-placeholder"></div>
                )}
                {badge ? <span className="card__badge">{badge}</span> : null}
            </div>
            <div className="card__body">
                <h3 className="card__title">{title}</h3>
                {metaEl}
                {date ? <p className="card__date">{date}</p> : null}
                {price ? <p className="card__price">{price}</p> : null}
                {descEl}
                {footer}
            </div>
        </div>
    );
}
