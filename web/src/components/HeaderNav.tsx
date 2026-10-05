'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, isNavActive } from '@/components/nav-items';
import styles from './SiteHeader.module.css';

/** Enlaces de la cabecera. «Cuenta» no va aquí: es el botón desplegable de AccountMenu. */
export function HeaderNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal" className={styles.nav}>
      {NAV_ITEMS.filter((item) => item.href !== '/cuenta').map((item) => (
        <Link key={item.href} href={item.href} className={styles.link} aria-current={isNavActive(item.href, pathname) ? 'page' : undefined}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
