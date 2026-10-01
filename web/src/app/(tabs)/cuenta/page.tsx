import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { signOutAction } from '@/lib/auth/actions';
import { createClient } from '@/lib/supabase/server';
import styles from './cuenta.module.css';

export const metadata: Metadata = { title: 'Cuenta' };

export default async function CuentaPage() {
  const supabase = await createClient();
  // getUser valida el token contra Supabase (no fiarse solo de la cookie).
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect('/login?next=/cuenta');

  // RLS: solo devuelve la fila propia. Puede no existir (usuarios anteriores al trigger).
  const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).maybeSingle();
  // user_metadata lo puede editar el propio usuario: solo como último recurso y acotado.
  const metaName = user.user_metadata?.first_name;
  const name = profile?.first_name || (typeof metaName === 'string' ? metaName.slice(0, 60) : null) || null;

  return (
    <main className={styles.main}>
      <h1>{name ? `Hola, ${name}` : 'Tu cuenta'}</h1>
      <p className={styles.email}>{user.email}</p>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" fullWidth>Cerrar sesión</Button>
      </form>
    </main>
  );
}
