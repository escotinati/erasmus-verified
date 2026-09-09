// ─────────────────────────────────────────────────────────────
//  navShared.jsx — piezas comunes a los tres patrones de header
//  (rama react/menu): .topnav (Nav.jsx), header.topbar y
//  .hero-legacy .topbar (ambos en TopbarNav.jsx).
//
//  Mismas reglas que Nav.jsx (ver el comentario largo de ese archivo
//  para el porqué): nada de esto depende de scripts externos
//  enganchados a DOMContentLoaded para resolver texto/idioma/tema —
//  cada pieza lee window.I18n / window.ERASMUS_EXPERIENCE ella misma.
//
//  AuthButton() llama a window.getSession()/window.signOut()
//  (authService.js, rama feature/auth-profiles) — funciones globales
//  sueltas de un <script> clásico, no algo que este módulo ES pueda
//  importar. Igual que con window.I18n/window.ERASMUS_EXPERIENCE, es
//  seguro asumir que ya existen cuando de verdad se necesitan (al
//  efecto inicial, o al pulsar "Cerrar sesión"): los scripts clásicos
//  de la página ya se han ejecutado en el parseo del HTML para cuando
//  el scheduler de React llega a comprometer el primer render de este
//  módulo (deferred), como ya se explica arriba para el resto de esta
//  familia de componentes.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';

export const NAV_LINKS = [
    { href: 'servicios.html', i18n: 'nav.services', label: 'Servicios', flag: 'showServices' },
    {
        href: 'alojamiento.html',
        i18n: 'nav.accommodation',
        label: 'Alojamiento',
        flag: 'showAlojamiento',
    },
    { href: 'viajes.html', i18n: 'nav.trips', label: 'Viajes', flag: 'showViajes' },
];

export const PARTIES_LINK = {
    href: 'https://erasmusparties.org',
    i18n: 'nav.parties',
    label: '🎉 Fiestas ↗',
};

export const VERIFIED_LINK = {
    href: 'https://erasmusverified.com',
    label: '🎓 Verified ↗',
};

export function currentPage() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    return path.split('?')[0] || 'index.html';
}

export function isPartiesExperience() {
    return window.ERASMUS_EXPERIENCE?.theme === 'theme-parties';
}

export function t(key, fallback) {
    return window.I18n?.t ? window.I18n.t(key) : fallback;
}

export function NavLinks({ page, onLinkClick }) {
    const parties = isPartiesExperience();
    const links = parties
        ? NAV_LINKS.filter((link) => window.ERASMUS_EXPERIENCE[link.flag])
        : NAV_LINKS;

    return (
        <>
            {links.map((link) => (
                <a
                    key={link.href}
                    href={link.href}
                    data-i18n={link.i18n}
                    className={link.href === page ? 'is-active' : undefined}
                    onClick={onLinkClick}
                >
                    {t(link.i18n, link.label)}
                </a>
            ))}
            {/* Sin onLinkClick a propósito, igual que la versión HTML original
                (nav.querySelectorAll('a:not(.nav-parties)')): abre en pestaña
                nueva, así que no tiene sentido cerrar el menú móvil al pulsarlo. */}
            {parties ? (
                <a
                    href={VERIFIED_LINK.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-verified"
                >
                    {VERIFIED_LINK.label}
                </a>
            ) : (
                <a
                    href={PARTIES_LINK.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-parties"
                    data-i18n={PARTIES_LINK.i18n}
                >
                    {t(PARTIES_LINK.i18n, PARTIES_LINK.label)}
                </a>
            )}
        </>
    );
}

export function LangSwitcherButton() {
    return (
        <button
            id="lang-switcher"
            className="lang-switcher"
            aria-label="Cambiar idioma"
            onClick={() => {
                const next = window.I18n?.getLang() === 'es' ? 'en' : 'es';
                localStorage.setItem('lang', next);
                location.reload();
            }}
        >
            {window.I18n?.getLang() === 'es' ? 'EN' : 'ES'}
        </button>
    );
}

export function AuthButton() {
    // null hasta que se resuelve getSession() — y también mientras no
    // hay sesión de verdad, así que sirve directamente como condición
    // para las dos ramas de abajo: sin sesión (incluido "todavía no lo
    // sabemos") es un <a> normal a login.html, con sesión es el
    // desplegable con "Cerrar sesión".
    const [session, setSession] = useState(null);
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        window.getSession?.().then((s) => {
            if (cancelled) return;
            setSession(s);
        });
        return () => {
            cancelled = true;
        };
    }, []);

    // Cierre al hacer clic fuera y con Escape — mismo criterio de foco
    // gestionado que ya exige el resto del nav (ver ARIA/foco de
    // setFieldError() en admin.js, rama
    // fix/admin-form-error-accessibility): Escape no solo cierra, sino
    // que devuelve el foco al botón que abrió el desplegable, para no
    // dejar el foco "perdido" en un elemento que acaba de desaparecer.
    // Solo hace falta en la rama CON sesión (la única que llega a
    // abrir un desplegable de verdad), pero el hook en sí no puede
    // colgarse de un `if` — por eso `open` ya es `false` siempre en la
    // otra rama y este efecto no hace nada.
    useEffect(() => {
        if (!open) return;
        function onPointerDown(e) {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        }
        function onKeyDown(e) {
            if (e.key === 'Escape') {
                setOpen(false);
                buttonRef.current?.focus();
            }
        }
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    async function handleLogout() {
        setOpen(false);
        await window.signOut?.();
        // Recarga completa a propósito (mismo criterio que
        // LangSwitcherButton): no hay estado de sesión en memoria que
        // sincronizar entre islas de React sueltas, así que la forma
        // más simple y fiable de que TODA la página refleje "sin
        // sesión" es recargar, no intentar propagar el cambio a mano.
        window.location.href = 'index.html';
    }

    // Sin sesión: el icono ES el enlace a login.html, sin desplegable
    // — login.html ya enlaza a registro.html para quien no tenga
    // cuenta todavía, así que no hace falta ofrecer las dos opciones
    // aquí. Cubre también el instante antes de que getSession()
    // resuelva (session sigue en null): no hay ninguna sesión real que
    // "perder" por dejar navegar a login.html un poco antes de tiempo.
    if (!session) {
        return (
            <a
                className="icon-btn"
                id="authBtn"
                href="login.html"
                aria-label="Iniciar sesión o registrarte"
                title="Iniciar sesión o registrarte"
            >
                <span className="material-symbols-outlined">person</span>
            </a>
        );
    }

    return (
        <div className="auth-menu" ref={wrapRef}>
            <button
                ref={buttonRef}
                className="icon-btn"
                id="authBtn"
                aria-label="Mi cuenta"
                title="Mi cuenta"
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
            >
                <span className="material-symbols-outlined">person</span>
            </button>
            {open && (
                <div className="auth-dropdown">
                    <button type="button" className="auth-dropdown-item" onClick={handleLogout}>
                        {t('auth.logout_cta', 'Cerrar sesión')}
                    </button>
                </div>
            )}
        </div>
    );
}

export function HamburgerButton({ open, onClick }) {
    return (
        <button
            className={`hamburger-btn${open ? ' is-open' : ''}`}
            id="hamburgerBtn"
            aria-label="Abrir menú"
            onClick={onClick}
        >
            <span></span>
            <span></span>
            <span></span>
        </button>
    );
}

export function MobileNavOverlay({ page, open, onClose }) {
    return (
        <div
            className={`mobile-nav${open ? ' is-open' : ''}`}
            id="mobileNav"
            aria-hidden={!open}
            data-react-nav="true"
        >
            <button
                className="mobile-nav-close"
                id="mobileNavClose"
                aria-label="Cerrar menú"
                onClick={onClose}
            >
                <span className="material-symbols-outlined">close</span>
            </button>
            <nav className="mobile-nav-links">
                <NavLinks page={page} onLinkClick={onClose} />
            </nav>
        </div>
    );
}
