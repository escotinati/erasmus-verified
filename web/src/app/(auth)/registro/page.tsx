import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { DEFAULT_NEXT, safeNextPath } from '@/lib/auth/validation';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Crear cuenta' };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function RegisterPage({ searchParams }: Props) {
  const { next: rawNext } = await searchParams;
  const next = safeNextPath(rawNext, DEFAULT_NEXT);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect(next);

  // El <h1> vive dentro de RegisterForm porque cambia tras el envío ("Revisa tu correo").
  return <RegisterForm next={next} />;
}
