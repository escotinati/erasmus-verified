'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

// Tres pestañas, como en los mockups. Las rutas de Mis entradas y Cuenta llegan en las fases 3-4.
const TABS = [
  { href: '/', label: 'Noches' },
  { href: '/mis-entradas', label: 'Mis entradas' },
  { href: '/cuenta', label: 'Cuenta' },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Principal">
      {TABS.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className={styles.tab} aria-current={active ? 'page' : undefined}>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
