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

  // Dos casos distintos: no sabemos si el correo quedó confirmado, así que no lo afirmamos.
  const notice =
    aviso === 'confirmado'
      ? 'Si has confirmado tu correo, ya puedes iniciar sesión.'
      : aviso === 'enlace'
        ? 'El enlace ha caducado o ya se usó. Si aún no puedes entrar, vuelve a registrarte para recibir uno nuevo.'
        : undefined;

  return (
    <>
      <h1>Inicia sesión</h1>
      <LoginForm next={target} notice={notice} />
    </>
  );
}
