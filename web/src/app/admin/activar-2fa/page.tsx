import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { AdminMfaEnroll } from '@/components/admin/AdminMfaEnroll';
import { getAdminStatus } from '@/lib/auth/admin';
import { createClient } from '@/lib/supabase/server';
import styles from '../admin.module.css';

export const metadata: Metadata = { title: 'Activar verificación en dos pasos', robots: { index: false, follow: false } };

/**
 * Alta del segundo factor (TOTP) de un admin. Solo la ve un admin con sesión que aún NO tiene factor verificado;
 * cualquier otro caso se redirige (misma regla que las acciones, que son la barrera real).
 */
export default async function AdminEnrollPage() {
  const supabase = await createClient();
  const { status } = await getAdminStatus(supabase);
  if (status === 'anonymous') redirect(`/login?next=${encodeURIComponent('/admin/activar-2fa')}`);
  if (status === 'not-admin') notFound();
  if (status === 'ok') redirect('/admin');

  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.totp.some((f) => f.status === 'verified')) redirect('/admin/verificar');

  return (
    <main className={`wide ${styles.main}`}>
      <h1 className={styles.title}>Activar verificación en dos pasos</h1>
      <div className={styles.card}>
        <p>
          El panel exige un código de 6 dígitos que cambia cada 30 segundos, además de tu contraseña. Necesitas una app
          de autenticación en tu móvil (Google Authenticator, Microsoft Authenticator, Authy, 1Password, Bitwarden…).
        </p>
        <ol className={styles.steps}>
          <li>Pulsa «Generar código QR».</li>
          <li>Escanéalo con tu app: aparecerá como «Erasmus Parties».</li>
          <li>Escribe aquí el código que muestra la app para confirmar.</li>
        </ol>
        <p>Hazlo ahora, tú mismo y con el móvil a mano: cualquiera que activara este paso antes que tú controlaría tu acceso.</p>
        <AdminMfaEnroll />
      </div>
    </main>
  );
}
