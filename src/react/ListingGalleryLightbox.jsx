// ─────────────────────────────────────────────────────────────
//  ListingGalleryLightbox.jsx — visor de fotos a pantalla completa de
//  ListingDetail.jsx (alojamiento.html/viaje.html), se abre al pulsar
//  la foto principal, la miniatura o el "+N" de la galería.
//
//  `<dialog>` nativo (mismo criterio que sheet.js: focus trap y
//  aislamiento del resto de la página "gratis" del propio elemento
//  con showModal(), sin reimplementarlo a mano) pero en REACT, a
//  diferencia de sheet.js — que es vanilla a propósito porque vive en
//  páginas con script clásico de orquestación. ListingDetail.jsx no
//  tiene ninguno (toda la página es la isla, ver CLAUDE.md), así que
//  aquí el patrón natural es un componente más, con su estado
//  (índice activo) en el padre.
//
//  Fotos: hoy son todas el mismo placeholder liso (ver el comentario
//  de listingsData.js) — el componente ya está listo para pintar una
//  <img> real en cuanto haya URLs, solo falta esa prop.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { t } from './navShared.jsx';

export default function ListingGalleryLightbox({ photoCount, activeIndex, onClose, onNavigate }) {
    const dialogRef = useRef(null);

    // showModal()/close() son imperativos (no hay prop `open` para
    // <dialog>) — este efecto es el único punto que los llama, así
    // que el ciclo de vida del propio elemento nativo manda.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return undefined;
        if (!dialog.open) dialog.showModal();
        return () => {
            if (dialog.open) dialog.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function goTo(index) {
        onNavigate(((index % photoCount) + photoCount) % photoCount);
    }

    function handleKeyDown(e) {
        if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
        if (e.key === 'ArrowRight') goTo(activeIndex + 1);
    }

    // Cierre al pulsar el fondo (::backdrop no es un nodo real, así
    // que un clic ahí llega con target === el propio <dialog>; un
    // clic dentro de .listing-lightbox-content nunca burbujea hasta
    // aquí con ese target).
    function handleBackdropClick(e) {
        if (e.target === dialogRef.current) onClose();
    }

    return (
        <dialog
            ref={dialogRef}
            className="listing-lightbox"
            onClose={onClose}
            onCancel={onClose}
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
        >
            <div className="listing-lightbox-content">
                <button
                    type="button"
                    className="listing-lightbox-close"
                    onClick={onClose}
                    aria-label={t('common.close', 'Cerrar')}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">
                        close
                    </span>
                </button>

                {photoCount > 1 ? (
                    <button
                        type="button"
                        className="listing-lightbox-nav listing-lightbox-nav--prev"
                        onClick={() => goTo(activeIndex - 1)}
                        aria-label={t('listing.gallery_prev', 'Foto anterior')}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            chevron_left
                        </span>
                    </button>
                ) : null}

                <div className="listing-lightbox-photo"></div>

                {photoCount > 1 ? (
                    <button
                        type="button"
                        className="listing-lightbox-nav listing-lightbox-nav--next"
                        onClick={() => goTo(activeIndex + 1)}
                        aria-label={t('listing.gallery_next', 'Foto siguiente')}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true">
                            chevron_right
                        </span>
                    </button>
                ) : null}

                {photoCount > 1 ? (
                    <div className="listing-lightbox-counter">
                        {activeIndex + 1} / {photoCount}
                    </div>
                ) : null}
            </div>
        </dialog>
    );
}
