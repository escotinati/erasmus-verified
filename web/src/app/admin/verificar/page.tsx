import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ButtonLink } from '@/components/ui/Button';
import { AdminMfaForm } from '@/components/admin/AdminMfaForm';
import { getAdminStatus } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import styles from '../admin.module.css';

export const metadata: Metadata = { title: 'Verificación en dos pasos', robots: { index: false, follow: false } };

export default async function AdminVerifyPage() {
  const supabase = await createClient();
  const { status } = await getAdminStatus(supabase);
  if (status === 'anonymous') redirect(`/login?next=${encodeURIComponent('/admin/verificar')}`);
  if (status === 'not-admin') notFound();
  if (status === 'ok') redirect('/admin');

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const hasFactor = Boolean(factors?.totp.some((f) => f.status === 'verified'));

  return (
    <main className={`wide ${styles.main}`}>
      <h1 className={styles.title}>Verificación en dos pasos</h1>
      <div className={styles.card}>
        {hasFactor ? (
          <>
            <p>Escribe el código de 6 dígitos de tu app de autenticación para entrar al panel.</p>
            <AdminMfaForm />
          </>
        ) : (
          <>
            <p>
              Tu cuenta es de administrador, pero aún no tiene la verificación en dos pasos configurada, y el panel la exige.
              Actívala ahora para entrar.
            </p>
            <ButtonLink href="/admin/activar-2fa" fullWidth>Activar verificación en dos pasos</ButtonLink>
            <ButtonLink href="/cuenta" variant="outline" fullWidth>Volver a mi cuenta</ButtonLink>
          </>
        )}
      </div>
    </main>
  );
}
