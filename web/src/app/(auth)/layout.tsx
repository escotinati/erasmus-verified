import { BackButton } from '@/components/ui/BackButton';
import styles from './auth-page.module.css';

/** Flujo de cuenta (la navegación inferior la pone el layout raíz). Escritorio: tarjeta centrada. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={`wide ${styles.page}`}>
      {/* En escritorio la cabecera ya lleva a Noches */}
      <div className={styles.back}>
        <BackButton label="Volver a las noches" />
      </div>
      <div className={styles.card}>{children}</div>
    </main>
  );
}
