import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/admin';
import styles from './admin.module.css';

// Pantalla interna: fuera de buscadores.
export const metadata: Metadata = { title: 'Panel de administrador', robots: { index: false, follow: false } };

export default async function AdminPage() {
  const { user } = await requireAdmin();

  return (
    <main className={`wide ${styles.main}`}>
      <h1 className={styles.title}>Panel de administrador</h1>
      <p className={styles.sub}>Sesión de {user.email} con verificación en dos pasos.</p>
      <p className={styles.note}>Aquí irá el dashboard. De momento esta pantalla solo comprueba el acceso.</p>
    </main>
  );
}
