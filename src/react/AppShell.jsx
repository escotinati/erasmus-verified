// ─────────────────────────────────────────────────────────────
//  AppShell.jsx — bottom nav móvil (isla React, feature/mobile-app-shell)
//
//  Antes: <nav class="app-bottom-nav"> duplicado byte a byte en las 8
//  páginas públicas (con 2 variantes de markup: 4 ítems en index.html,
//  3 en el resto) + un <script> inline duplicado calculando el ítem
//  activo. Ahora vive aquí una sola vez, con un array de configuración
//  único — ver docs/mobile-app-shell.md.
//
//  A petición: sin pestaña "Inicio"/"Noches" — el logo (topnav/topbar,
//  siempre visible) ya lleva a index.html en las dos experiencias, así
//  que esa pestaña era una redundancia pura, no una ruta a la que solo
//  se pudiera llegar desde aquí (a diferencia de servicios/viajes, que
//  no tienen acceso equivalente en el topnav móvil).
//
//  A petición: sin pestaña "Mapa" tampoco (no llevaba a una página útil
//  en el flujo actual). En su lugar, "Perfil" → login.html: antes de
//  esto no había NINGÚN punto de acceso a login/registro en móvil — el
//  icono de cuenta del topnav/topbar (#authBtn, navShared.jsx) es
//  .icon-btn, oculto por debajo de --bp-md. Enlace simple (como
//  servicios/viajes), sin la lógica de sesión de AuthButton: no hay
//  página de perfil propia todavía a la que llevar a un usuario ya
//  logueado, así que esa lógica se queda en el icono de escritorio por
//  ahora — si en el futuro se añade una página de perfil real, esta
//  pestaña es el sitio natural para adoptar ese mismo comportamiento.
//
//  Mismo patrón que Nav.jsx (leer su comentario largo para el porqué):
//  nada de esto depende de un script externo enganchado a
//  DOMContentLoaded para encontrar/mutar este nav después de montado
//  — el componente resuelve tema Parties / idioma / ítem activo él
//  mismo, en su propio render. experience.js ya no toca
//  .app-bottom-nav directamente (sus bloques 4 y 6, que ocultaban
//  "Fiestas" e inyectaban "Verified" a mano, ahora llevan el mismo
//  guard [data-react-nav] que ya usan sus bloques 1/3/5 para el
//  topnav — este componente resuelve ambos casos internamente).
// ─────────────────────────────────────────────────────────────

import { currentPage, isPartiesExperience, t, PARTIES_LINK, VERIFIED_LINK } from './navShared.jsx';

function buildItems() {
    const parties = isPartiesExperience();

    return [
        {
            key: 'services',
            href: 'servicios.html',
            icon: 'storefront',
            i18n: 'nav.services',
            fallback: 'Servicios',
            shortI18n: 'nav.services_short',
            shortFallback: 'Serv.',
        },
        {
            key: 'trips',
            href: 'viajes.html',
            icon: 'flight',
            i18n: 'nav.trips',
            fallback: 'Viajes',
        },
        {
            key: 'profile',
            href: 'login.html',
            icon: 'person',
            i18n: 'nav.account',
            fallback: 'Perfil',
        },
        {
            // Salto de dominio (Fiestas↔Verified): no es una pestaña real,
            // nunca lleva --active. Color de marca de destino permanente —
            // reutiliza las clases/colores que YA existían para este mismo
            // enlace (app-bottom-nav-item--parties / nav-verified, ver
            // src/css/styles.css), antes aplicadas a mano desde
            // experience.js.
            key: 'domain',
            href: parties ? VERIFIED_LINK.href : PARTIES_LINK.href,
            icon: parties ? 'verified' : 'nightlife',
            i18n: parties ? 'nav.verified_bottom' : 'nav.parties_bottom',
            fallback: parties ? 'Verified' : 'Fiestas',
            brandClass: parties ? 'nav-verified' : 'app-bottom-nav-item--parties',
            external: true,
        },
    ];
}

export default function AppShell() {
    const page = currentPage();
    const items = buildItems();

    return (
        <nav
            className="app-bottom-nav"
            id="appBottomNav"
            aria-label="Navegación principal"
            data-react-nav="true"
        >
            {items.map((item) => {
                const active = !item.external && item.href === page;
                const label = t(item.i18n, item.fallback);
                const shortLabel = item.shortI18n ? t(item.shortI18n, item.shortFallback) : label;

                return (
                    <a
                        key={item.key}
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        className={
                            'app-bottom-nav-item' +
                            (item.brandClass ? ' ' + item.brandClass : '') +
                            (active ? ' app-bottom-nav-item--active' : '')
                        }
                        aria-current={active ? 'page' : undefined}
                    >
                        <span className="app-bottom-nav-icon">
                            <span className="material-symbols-outlined">{item.icon}</span>
                        </span>
                        <span className="app-bottom-nav-label">
                            <span className="app-bottom-nav-label-full">{label}</span>
                            <span className="app-bottom-nav-label-short">{shortLabel}</span>
                        </span>
                    </a>
                );
            })}
        </nav>
    );
}
