// ─────────────────────────────────────────────────────────────
//  BackToTop.jsx — botón flotante "volver arriba" (isla React).
//  Aparece al bajar más de un viewport de scroll. Se monta junto al
//  bottom-nav (mount-shell.jsx), así que está en las 10 páginas
//  públicas; en mapa.html la página no hace scroll y nunca se ve.
//  Todo el estado (visible/oculto) vive aquí dentro, sin scripts
//  externos buscando el nodo (ver regla de DOMContentLoaded en CLAUDE.md).
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';
import { t } from './navShared.jsx';

export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let ticking = false;
        const update = () => {
            ticking = false;
            setVisible(window.scrollY > window.innerHeight * 0.8);
        };
        const onScroll = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const goTop = () => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    };

    const label = t('nav.back_to_top', 'Volver arriba');

    return (
        <button
            type="button"
            className={'back-to-top' + (visible ? ' back-to-top--visible' : '')}
            onClick={goTop}
            aria-label={label}
            title={label}
            tabIndex={visible ? 0 : -1}
            aria-hidden={visible ? undefined : 'true'}
        >
            <span className="material-symbols-outlined" aria-hidden="true">
                arrow_upward
            </span>
        </button>
    );
}
