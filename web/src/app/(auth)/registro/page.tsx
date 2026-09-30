import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect('/cuenta');

  // El <h1> vive dentro de RegisterForm porque cambia tras el envío ("Revisa tu correo").
  return <RegisterForm />;
}
