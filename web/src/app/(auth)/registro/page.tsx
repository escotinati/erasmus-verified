import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Crear cuenta' };

export default async function RegisterPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect('/cuenta');

  return (
    <>
      <h1>Crea tu cuenta</h1>
      <RegisterForm />
    </>
  );
}
