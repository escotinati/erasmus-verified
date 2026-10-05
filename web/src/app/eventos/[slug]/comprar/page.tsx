import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { OrderBreakdown } from '@/components/tickets/OrderBreakdown';
import { CheckoutNotice, CheckoutShell, EventSummary } from '@/components/tickets/CheckoutShell';
import { ButtonLink } from '@/components/ui/Button';
import { StatusScreen } from '@/components/ui/StatusScreen';
import { requireUser } from '@/lib/auth/session';
import { loadCheckout } from '@/lib/checkout/load';
import { isSimulatedCheckoutAllowed } from '@/lib/checkout/simulation';
import { loadEvent } from '@/lib/events';
import { encodeSelection } from '@/lib/selection';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug);
  // Pantalla de proceso, no de contenido: fuera de buscadores.
  return { title: event ? `Resumen · ${event.name}` : 'Noche no encontrada', robots: { index: false } };
}

/**
 * Resumen de la compra. La selección llega en la URL pero aquí se valida y se recalcula
 * contra las tarifas reales: lo que se muestra nunca sale de lo que diga el cliente.
 */
export default async function ComprarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { t } = await searchParams;
  const checkout = await loadCheckout(slug, typeof t === 'string' ? t : undefined);
  if (checkout.status === 'no-event') notFound();

  const fichaHref = `/eventos/${checkout.event.slug}`;
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
  // Comprar exige cuenta. Volvemos aquí con la selección ya validada, no con la cruda.
  await requireUser(`${fichaHref}/comprar?t=${encoded}`);

  return (
    <CheckoutShell
      title="Resumen"
      back={{ href: `${fichaHref}?t=${encoded}`, label: 'Volver a elegir entradas' }}
      aside={
        <>
          <div>
            <OrderBreakdown rates={event.rates} selection={selection} summary={summary} />
          </div>
          {(await isSimulatedCheckoutAllowed()) ? (
            <ButtonLink href={`${fichaHref}/pagar?t=${encoded}`} fullWidth>
              Continuar al pago
            </ButtonLink>
          ) : (
            <CheckoutNotice>El pago estará disponible muy pronto.</CheckoutNotice>
          )}
        </>
      }
    >
      <EventSummary event={event} />
      {adjusted && (
        <CheckoutNotice live>Hemos ajustado tu selección a las entradas disponibles ahora mismo. Revisa el total antes de seguir.</CheckoutNotice>
      )}
    </CheckoutShell>
  );
}
