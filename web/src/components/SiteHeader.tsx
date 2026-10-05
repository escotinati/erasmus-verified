import Link from 'next/link';
import { AccountMenu } from '@/components/AccountMenu';
import { HeaderNav } from '@/components/HeaderNav';
import { NAME_MAX } from '@/lib/auth/validation';
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
  // Inicial del nombre con el que se registró (si no hay nombre, la del correo). Solo se pinta; no autoriza nada.
  // Sale de los metadatos de la sesión (ya cargados con getUser): sin una consulta extra a `profiles` en cada navegación.
  const user = data.user;
  const metaName = user?.user_metadata?.first_name;
  const displayName = user ? ((typeof metaName === 'string' ? metaName.slice(0, NAME_MAX) : '') || user.email || '') : '';
  // Solo para decidir si se enseña el enlace al panel (el panel vuelve a comprobarlo en el servidor).
  const isAdmin = user ? (await supabase.rpc('is_admin')).data === true : false;
  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.dot} aria-hidden="true" />
          {experience === 'parties' ? 'Erasmus Parties' : 'Erasmus Verified'}
        </Link>
        <div className={styles.right}>
          <HeaderNav />
          <AccountMenu loggedIn={Boolean(user)} initial={initial} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
