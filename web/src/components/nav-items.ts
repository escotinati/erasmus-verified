import type { IconName } from '@/components/Icon';

/** Las tres secciones principales. Las comparten la barra inferior (móvil) y la cabecera (escritorio). */
export const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Noches', icon: 'moon' },
  { href: '/mis-entradas', label: 'Mis entradas', icon: 'ticket' },
  { href: '/cuenta', label: 'Cuenta', icon: 'user' },
];

/** Noches incluye la ficha de un evento (/eventos/…), que cuelga de ella. */
export function isNavActive(href: string, pathname: string): boolean {
  return href === '/' ? pathname === '/' || pathname.startsWith('/eventos') : pathname.startsWith(href);
}
