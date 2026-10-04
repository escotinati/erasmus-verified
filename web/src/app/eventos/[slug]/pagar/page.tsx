import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CheckoutNotice, CheckoutShell, EventSummary } from '@/components/tickets/CheckoutShell';
import { OrderBreakdown } from '@/components/tickets/OrderBreakdown';
import { PayButton } from '@/components/tickets/PayButton';
import { ButtonLink } from '@/components/ui/Button';
import { StatusScreen } from '@/components/ui/StatusScreen';
import { getFirstName, requireUser } from '@/lib/auth/session';
import { payAction } from '@/lib/checkout/actions';
import { loadCheckout } from '@/lib/checkout/load';
import { isSimulatedCheckoutAllowed } from '@/lib/checkout/simulation';
import { loadEvent } from '@/lib/events';
import { formatEuros } from '@/lib/format';
import { encodeSelection } from '@/lib/selection';
import styles from './pagar.module.css';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string | string[]; cambio?: string | string[]; error?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug);
  return { title: event ? `Pago · ${event.name}` : 'Noche no encontrada', robots: { index: false } };
}

/**
 * Pago SIMULADO. No pide datos nuevos: el comprador es la cuenta (nombre del perfil) y la edad
 * mínima se avisa como regla del evento ("lleva DNI"). Todo se valida y recalcula en el servidor.
 */
export default async function PagarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { t, cambio, error } = await searchParams;
  const checkout = await loadCheckout(slug, typeof t === 'string' ? t : undefined);
  if (checkout.status === 'no-event') notFound();

  const fichaHref = `/eventos/${checkout.event.slug}`;
  if (!(await isSimulatedCheckoutAllowed())) {
    return (
      <StatusScreen title="El pago llega muy pronto" text="Todavía no se pueden comprar entradas. Vuelve a la ficha para ver la noche.">
        <ButtonLink href={fichaHref}>Volver a la ficha</ButtonLink>
      </StatusScreen>
    );
  }
  if (checkout.status === 'no-selection') {
    if (!checkout.hasRaw) redirect(fichaHref);
    return (
      <StatusScreen title="Tu selección ya no está disponible" text="Las entradas que elegiste se han agotado o el enlace no es válido.">
        <ButtonLink href={fichaHref}>Volver a elegir entradas</ButtonLink>
      </StatusScreen>
    );
  }

  const { event, selection, adjusted, summary } = checkout;
  const encoded = encodeSelection(selection);
  const { supabase, user } = await requireUser(`${fichaHref}/pagar?t=${encoded}`);
  const name = await getFirstName(supabase, user);
  const changed = cambio === '1';
  const live = changed || adjusted;
  // Fallo al guardar el pedido (nunca se ha cobrado nada). 'config' solo ayuda a quien despliega.
  const saveError = error === 'config' ? 'config' : error === 'guardar' ? 'guardar' : null;

  return (
    <CheckoutShell title="Pago" back={{ href: `${fichaHref}/comprar?t=${encoded}`, label: 'Volver al resumen' }}>
      <CheckoutNotice>Modo de prueba: no se cobrará nada ni se emitirá ninguna entrada, pero verás el pedido en «Mis entradas».</CheckoutNotice>

      {saveError && (
        <CheckoutNotice live>
          {saveError === 'config'
            ? 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor: no se puede guardar el pedido. No se ha cobrado nada.'
            : 'No hemos podido guardar tu pedido. No se ha cobrado nada: inténtalo de nuevo en unos segundos.'}
        </CheckoutNotice>
      )}

      {live && (
        <CheckoutNotice live>
          {changed
            ? 'El precio o la disponibilidad han cambiado. Revisa el nuevo total antes de pagar.'
            : 'Hemos ajustado tu selección a las entradas disponibles ahora mismo. Revisa el total antes de pagar.'}
        </CheckoutNotice>
      )}

      <EventSummary event={event} />

      <section className={styles.buyer} aria-label="Comprador">
        <h2 className={styles.heading}>Comprador</h2>
        <p className={styles.buyerName}>{name ?? 'Tu cuenta'}</p>
        <p className={styles.buyerMail}>{user.email}</p>
        {event.minAge !== null && (
          <p className={styles.age}>
            Evento para mayores de {event.minAge} años. Lleva tu DNI: en la puerta pueden pedírtelo.
          </p>
        )}
      </section>

      <OrderBreakdown rates={event.rates} selection={selection} summary={summary} />

      <form action={payAction} className={styles.form}>
        <input type="hidden" name="slug" value={event.slug} />
        <input type="hidden" name="t" value={encoded} />
        <input type="hidden" name="total" value={summary.totalCents} />
        <PayButton label={`Pagar ${formatEuros(summary.totalCents)}`} />
      </form>
    </CheckoutShell>
  );
}
