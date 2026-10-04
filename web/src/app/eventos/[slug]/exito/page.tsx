import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CheckoutNotice, CheckoutShell } from '@/components/tickets/CheckoutShell';
import { OrderCard } from '@/components/tickets/OrderCard';
import { ButtonLink } from '@/components/ui/Button';
import { requireUser } from '@/lib/auth/session';
import { getMyOrder, isOrderId } from '@/lib/checkout/orders';
import styles from './exito.module.css';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ pedido?: string | string[] }>;
};

export const metadata: Metadata = { title: 'Pedido realizado', robots: { index: false } };

/**
 * Final del flujo. Lee un pedido PROPIO (id en `?pedido=`) con el cliente del usuario: la RLS impide
 * ver el de otro, y un id ajeno o inventado se trata igual que uno que no existe. Llegar aquí no
 * prueba nada por sí mismo; solo cuenta lo que haya guardado en la base de datos.
 * TODO(fase 5): con pago real, el estado 'paid' lo fijará el webhook de Fourvenues.
 */
export default async function ExitoPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { pedido } = await searchParams;
  const id = typeof pedido === 'string' ? pedido : '';
  const { supabase } = await requireUser(`/eventos/${encodeURIComponent(slug)}/exito?pedido=${encodeURIComponent(id)}`);

  const order = isOrderId(id) ? await getMyOrder(supabase, id) : null;
  if (!order || order.eventSlug !== slug) redirect('/mis-entradas');

  return (
    <CheckoutShell title={order.provider === 'simulated' ? 'Prueba completada' : 'Pedido realizado'}>
      {order.provider === 'simulated' && (
        <CheckoutNotice>
          Esto ha sido una simulación: no se ha cobrado nada y no se ha emitido ninguna entrada. El pedido queda guardado en tu historial.
        </CheckoutNotice>
      )}
      <OrderCard order={order} />
      <p className={styles.text}>Cuando el pago real esté activo, tus entradas con su código de acceso aparecerán en «Mis entradas».</p>
      <div className={styles.actions}>
        <ButtonLink href="/mis-entradas" fullWidth>
          Ir a Mis entradas
        </ButtonLink>
        <ButtonLink href="/" variant="outline" fullWidth>
          Volver a Noches
        </ButtonLink>
      </div>
    </CheckoutShell>
  );
}
