import Link from 'next/link';
import { Icon } from '@/components/Icon';
import styles from './auth-page.module.css';

/** Flujo de cuenta a pantalla completa, sin navegación inferior. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <Link href="/" className={styles.back} aria-label="Volver a las noches">
        <Icon name="back" size={24} />
      </Link>
      <div className={styles.card}>{children}</div>
    </main>
  );
}
