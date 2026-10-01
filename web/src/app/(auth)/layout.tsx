import { BackButton } from '@/components/ui/BackButton';
import styles from './auth-page.module.css';

/** Flujo de cuenta (la navegación inferior la pone el layout raíz). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <BackButton label="Volver a las noches" />
      <div className={styles.card}>{children}</div>
    </main>
  );
}
