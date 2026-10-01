'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, type IconName } from '@/components/Icon';
import styles from './BottomNav.module.css';

// Tres pestañas, como en los mockups. Las rutas de Mis entradas y Cuenta llegan en las fases 3-4.
const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Noches', icon: 'moon' },
  { href: '/mis-entradas', label: 'Mis entradas', icon: 'ticket' },
  { href: '/cuenta', label: 'Cuenta', icon: 'user' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className={`dock ${styles.nav}`} aria-label="Principal">
      {TABS.map((tab) => {
        // Noches incluye la ficha de un evento (/eventos/…), que cuelga de ella.
        const active = tab.href === '/' ? pathname === '/' || pathname.startsWith('/eventos') : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className={styles.tab} aria-current={active ? 'page' : undefined}>
            <Icon name={tab.icon} size={22} />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
