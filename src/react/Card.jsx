// ─────────────────────────────────────────────────────────────
//  Card.jsx — la card única de la web (fase 1 de la familia de cards).
//  Sustituye a SummaryCard.jsx, que tenía dos ramas (partner/event)
//  con markup y clases distintas.
//
//  Una sola estructura con slots OPCIONALES — cada tipo de card
//  (anunciante de partner, evento, y en fases futuras alojamiento,
//  servicio, ciudad…) es una combinación de slots, no un componente
//  aparte. Un slot sin valor no se renderiza.
//
//    media        imageUrl (+ imageAlt) · badge
//    body         title · meta · date · price · description
//    cta          { kind, label, href, onClick }
//
//  CTA_KINDS es el ÚNICO sitio donde se define qué es cada tipo de
//  botón (clase, icono). Añadir un tipo nuevo (p. ej. 'offer' o
//  'directions' en fases siguientes) = una entrada aquí + su
//  modificador en card.css.
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
};

function CardCta({ kind = 'info', label, href, onClick }) {
    const safeHref = window.sanitizeUrl(href);
    if (!safeHref) return null;
    const { icon } = CTA_KINDS[kind] || CTA_KINDS.info;

    return (
        <div className={`card__footer card__footer--${kind}`}>
            <a
                className={`card-cta card-cta--${kind}`}
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClick}
            >
                <span>{label}</span>
                {icon ? <span className="material-symbols-outlined">{icon}</span> : null}
            </a>
        </div>
    );
}

export default function Card({
    imageUrl,
    imageAlt = '',
    badge,
    title,
    meta,
    date,
    price,
    description,
    cta,
    className,
}) {
    const safeImageUrl = window.sanitizeUrl(imageUrl);

    return (
        <div className={`card ${className || ''}`.trim()}>
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
                {meta ? (
                    <p className="card__meta">
                        <span className="material-symbols-outlined">location_on</span>
                        <span>{meta}</span>
                    </p>
                ) : null}
                {date ? <p className="card__date">{date}</p> : null}
                {price ? <p className="card__price">{price}</p> : null}
                {description ? <p className="card__desc">{description}</p> : null}
                {cta && cta.href ? <CardCta {...cta} /> : null}
            </div>
        </div>
    );
}
