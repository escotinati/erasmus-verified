import type { Metadata } from 'next';
import { Button } from '@/components/ui/Button';
import { signOutAction } from '@/lib/auth/actions';
import { getFirstName, requireUser } from '@/lib/auth/session';
import styles from './cuenta.module.css';

export const metadata: Metadata = { title: 'Cuenta' };

export default async function CuentaPage() {
  // getUser valida el token contra Supabase (no fiarse solo de la cookie).
  const { supabase, user } = await requireUser('/cuenta');
  const name = await getFirstName(supabase, user);

  return (
    <main className={`wide ${styles.main}`}>
      <h1>{name ? `Hola, ${name}` : 'Tu cuenta'}</h1>
      <p className={styles.email}>{user.email}</p>
      <form action={signOutAction} className={styles.form}>
        <Button type="submit" variant="outline" fullWidth>Cerrar sesión</Button>
      </form>
    </main>
  );
}
