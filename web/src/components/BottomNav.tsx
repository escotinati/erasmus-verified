'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { NAV_ITEMS, isNavActive } from '@/components/nav-items';
import styles from './BottomNav.module.css';

/** Menú móvil (por debajo de 900 px). En escritorio lo sustituye SiteHeader. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className={`dock ${styles.nav}`} aria-label="Principal">
      {NAV_ITEMS.map((tab) => (
        <Link key={tab.href} href={tab.href} className={styles.tab} aria-current={isNavActive(tab.href, pathname) ? 'page' : undefined}>
          <Icon name={tab.icon} size={22} />
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
