import type { TicketRate } from './fourvenues/types';

/**
 * Cálculo del pedido. ÚNICA fuente de verdad del total que ve el usuario.
 * Todo en céntimos enteros. En la fase de compra real, el servidor recalcula con
 * los precios de Fourvenues y NUNCA se fía de este resultado (viene del cliente).
 */
export const MAX_PER_RATE = 10;

/** rateId -> cantidad */
export type Selection = Record<string, number>;

/** Máximo seleccionable de una tarifa: 0 si agotada, si no el menor entre stock y tope por pedido. */
export function maxQty(rate: TicketRate): number {
  if (rate.soldOut) return 0;
  return Math.max(0, Math.min(MAX_PER_RATE, rate.available ?? MAX_PER_RATE));
}

export function clampQty(rate: TicketRate, qty: number): number {
  if (!Number.isFinite(qty)) return 0;
  return Math.min(maxQty(rate), Math.max(0, Math.trunc(qty)));
}

export interface OrderSummary {
  tickets: number;
  subtotalCents: number;
  feesCents: number;
  totalCents: number;
}

export function summarize(rates: TicketRate[], selection: Selection): OrderSummary {
  let tickets = 0;
  let subtotalCents = 0;
  let feesCents = 0;
  for (const rate of rates) {
    const qty = clampQty(rate, selection[rate.id] ?? 0);
    tickets += qty;
    subtotalCents += qty * rate.priceCents;
    feesCents += qty * rate.feeCents;
  }
  return { tickets, subtotalCents, feesCents, totalCents: subtotalCents + feesCents };
}
