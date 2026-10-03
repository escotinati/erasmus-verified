import 'server-only';
import { loadEvent } from '@/lib/events';
import type { NightEvent } from '@/lib/fourvenues/types';
import { summarize, type OrderSummary, type Selection } from '@/lib/pricing';
import { parseSelection } from '@/lib/selection';

export type Checkout =
  | { status: 'no-event' }
  /** Falta la selección o ya no queda ninguna entrada comprable. */
  | { status: 'no-selection'; event: NightEvent; hasRaw: boolean }
  | { status: 'ok'; event: NightEvent; selection: Selection; adjusted: boolean; summary: OrderSummary };

/**
 * Valida la selección que llega del cliente (`?t=`) contra las tarifas REALES del evento y recalcula
 * el total. Lo usan el resumen, el pago y la acción de pagar: el servidor nunca se fía de importes
 * ni cantidades que vengan del cliente.
 */
export async function loadCheckout(slug: string, raw: string | undefined): Promise<Checkout> {
  const event = await loadEvent(slug);
  if (!event) return { status: 'no-event' };
  if (!raw) return { status: 'no-selection', event, hasRaw: false };

  const { selection, adjusted } = parseSelection(raw, event.rates);
  const summary = summarize(event.rates, selection);
  if (summary.tickets === 0) return { status: 'no-selection', event, hasRaw: true };
  return { status: 'ok', event, selection, adjusted, summary };
}
