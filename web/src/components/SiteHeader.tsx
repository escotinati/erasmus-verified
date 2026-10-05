import Link from 'next/link';
import { AccountMenu } from '@/components/AccountMenu';
import { HeaderNav } from '@/components/HeaderNav';
import { getExperience } from '@/lib/get-experience';
import { createClient } from '@/lib/supabase/server';
import styles from './SiteHeader.module.css';

/**
 * Menú de escritorio (desde 900 px; por debajo se oculta y manda BottomNav).
 * getUser() valida el token contra Supabase, pero aquí solo decide qué botón enseñar:
 * la autorización real sigue en cada página (requireUser).
 */
export async function SiteHeader() {
  const experience = await getExperience();
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.dot} aria-hidden="true" />
          {experience === 'parties' ? 'Erasmus Parties' : 'Erasmus Verified'}
        </Link>
        <div className={styles.right}>
          <HeaderNav />
          <AccountMenu loggedIn={Boolean(data.user)} />
        </div>
      </div>
    </header>
  );
}
