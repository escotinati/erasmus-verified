import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { safeNextPath } from '@/lib/auth/validation';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Iniciar sesión' };

type Props = { searchParams: Promise<{ next?: string; aviso?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { next, aviso } = await searchParams;
  const target = safeNextPath(next, '/cuenta');

  // Si ya hay sesión, no tiene sentido ver el login.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect(target);

  const notice =
    aviso === 'confirmado' ? 'Si acabas de confirmar tu correo, ya puedes iniciar sesión.' : undefined;

  return (
    <>
      <h1>Inicia sesión</h1>
      <LoginForm next={target} notice={notice} />
    </>
  );
}
