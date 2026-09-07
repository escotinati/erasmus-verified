// ─────────────────────────────────────────────────────────────
//  PartnerDetail.jsx — contenido del Sheet que se abre al pulsar un
//  partner en ciudad.html/mapa.html: descripción + enlaces + botón
//  "Cómo llegar". Sustituye a buildPartnerDetail() (antes DOM
//  imperativo en mapPartners.js) — misma estructura, copiada campo a
//  campo, sin rediseño. El propio <dialog> (sheet.js) NO se toca: sigue
//  siendo vanilla a propósito (focus trap, drag-to-close, <dialog>
//  nativo — ver el comentario de cabecera de ese archivo).
//
//  Presentacional puro (sin fetch ni estado propio, como SummaryCard/
//  PartnerCategoryList): partner.description y cada link.label llegan
//  YA traducidos — de hecho fetchPartnersByCity() (partnersService.js)
//  ya los resuelve con I18n.tField() antes de que este componente los
//  vea, así que aquí NUNCA hace falta llamar a I18n. Mismo reparto de
//  trabajo que las otras dos islas: la traducción de dominio vive en
//  el script clásico (o, en este caso, ya un nivel más abajo, en el
//  propio service), el componente solo pinta.
//
//  Cada link.url se sanea con sanitizeUrl() (global, ver
//  src/js/utils/sanitize.js) AQUÍ DENTRO, no en el padre — mismo
//  patrón que sanitizeUrl(image_url) en PartnerCategoryList.jsx.
//  partner.links viene de partner_links (Supabase), editable desde
//  /admin por cualquier admin: el saneado no es opcional. Si la URL no
//  es válida, ese link no se renderiza — nunca un <a> muerto.
//
//  No llama a trackEvent(): delega en onLinkClick(link, safeUrl) y
//  onDirectionsClick(), igual que SummaryCard delega onCtaClick — el
//  tracking se queda en mapPartners.js.
//
//  Sin `id` en los links: fetchPartnersByCity() no incluye ese campo
//  en el objeto que arma para cada link (ver partnersService.js) — se
//  usa link.url como key, es el único campo realmente estable que
//  identifica un link entre renders.
// ─────────────────────────────────────────────────────────────

export default function PartnerDetail({
    partner,
    directionsLabel,
    onLinkClick,
    onDirectionsClick,
}) {
    const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${partner.lat},${partner.lng}`;

    return (
        <div className="partner-detail">
            <p className="partner-detail__description">{partner.description}</p>

            {partner.links.map((link) => {
                const safeUrl = window.sanitizeUrl(link.url);
                if (!safeUrl) return null;

                return (
                    <a
                        key={link.url}
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="partner-detail__link"
                        onClick={() => onLinkClick(link, safeUrl)}
                    >
                        {link.label}
                    </a>
                );
            })}

            <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="partner-detail__directions"
                onClick={onDirectionsClick}
            >
                {directionsLabel}
            </a>
        </div>
    );
}
