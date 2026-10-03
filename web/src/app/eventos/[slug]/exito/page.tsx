import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CheckoutNotice, CheckoutShell, EventSummary } from '@/components/tickets/CheckoutShell';
import { ButtonLink } from '@/components/ui/Button';
import { requireUser } from '@/lib/auth/session';
import { loadCheckout } from '@/lib/checkout/load';
import { isSimulatedCheckoutAllowed } from '@/lib/checkout/simulation';
import { loadEvent } from '@/lib/events';
import { encodeSelection } from '@/lib/selection';
import styles from './exito.module.css';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug);
  return { title: event ? `Pedido simulado · ${event.name}` : 'Noche no encontrada', robots: { index: false } };
}

/**
 * Final del flujo SIMULADO. No hay pedido guardado, así que esta pantalla solo repite lo que
 * se acaba de recorrer (validado de nuevo en el servidor) y NO es una prueba de compra.
 * TODO(fase 5): con el pago real, la confirmación vendrá del webhook de Fourvenues, nunca de llegar
 * aquí por `?t=`. Esta página tendrá que leer un pedido propio (RLS), no la URL.
 */
export default async function ExitoPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { t } = await searchParams;
  if (!(await isSimulatedCheckoutAllowed())) redirect(`/eventos/${encodeURIComponent(slug)}`);
  const checkout = await loadCheckout(slug, typeof t === 'string' ? t : undefined);
  if (checkout.status === 'no-event') notFound();
  if (checkout.status === 'no-selection') redirect(`/eventos/${checkout.event.slug}`);

  const { event, selection, summary } = checkout;
  await requireUser(`/eventos/${event.slug}/exito?t=${encodeSelection(selection)}`);

  return (
    <CheckoutShell title="Prueba completada">
      <CheckoutNotice>
        Esto ha sido una simulación: no se ha cobrado nada y no se ha emitido ninguna entrada.
      </CheckoutNotice>
      <EventSummary event={event} />
      <p className={styles.text}>
        Has recorrido el proceso con {summary.tickets} {summary.tickets === 1 ? 'entrada' : 'entradas'}. Cuando el pago real esté
        activo, tus entradas aparecerán en «Mis entradas».
      </p>
      <div className={styles.actions}>
        <ButtonLink href="/" fullWidth>
          Volver a Noches
        </ButtonLink>
        <ButtonLink href="/mis-entradas" variant="outline" fullWidth>
          Ir a Mis entradas
        </ButtonLink>
      </div>
    </CheckoutShell>
  );
}
