import type { Metadata } from 'next';
import { OrderCard } from '@/components/tickets/OrderCard';
import { ButtonLink } from '@/components/ui/Button';
import { requireUser } from '@/lib/auth/session';
import { listMyOrders } from '@/lib/checkout/orders';
import styles from './mis-entradas.module.css';

export const metadata: Metadata = { title: 'Mis entradas', robots: { index: false } };

/**
 * Pedidos del usuario, del más reciente al más antiguo. Se leen con SU cliente de Supabase: la RLS
 * de la base de datos garantiza que solo ve los suyos. Requiere sesión.
 * TODO(fase 5): aquí irán las entradas individuales (código de acceso, usada o no), que vienen de Fourvenues.
 */
export default async function MisEntradasPage() {
  const { supabase } = await requireUser('/mis-entradas');
  const orders = await listMyOrders(supabase);

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Mis entradas</h1>
      {orders.length === 0 ? (
        <section className={styles.empty} aria-labelledby="sin-entradas">
          <h2 id="sin-entradas" className={styles.emptyTitle}>Aún no tienes entradas</h2>
          <p className={styles.emptyText}>Cuando compres una, la verás aquí con su código de acceso.</p>
          <ButtonLink href="/" fullWidth>
            Ver noches
          </ButtonLink>
        </section>
      ) : (
        <>
          <p className={styles.note}>Tus pedidos. Los códigos de acceso aparecerán aquí cuando esté activo el pago real.</p>
          <ul className={styles.list}>
            {orders.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
