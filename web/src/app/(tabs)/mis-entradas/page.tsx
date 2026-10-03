import type { Metadata } from 'next';
import { ButtonLink } from '@/components/ui/Button';
import { requireUser } from '@/lib/auth/session';
import styles from './mis-entradas.module.css';

export const metadata: Metadata = { title: 'Mis entradas' };

/**
 * Entradas del usuario. Todavía no hay pedidos guardados (llegan con la tabla de pedidos y la
 * integración de pago), así que solo existe el estado vacío. Requiere sesión.
 */
export default async function MisEntradasPage() {
  await requireUser('/mis-entradas');

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Mis entradas</h1>
      <section className={styles.empty} aria-labelledby="sin-entradas">
        <h2 id="sin-entradas" className={styles.emptyTitle}>Aún no tienes entradas</h2>
        <p className={styles.emptyText}>Cuando compres una, la verás aquí con su código de acceso.</p>
        <ButtonLink href="/" fullWidth>
          Ver noches
        </ButtonLink>
      </section>
    </main>
  );
}
