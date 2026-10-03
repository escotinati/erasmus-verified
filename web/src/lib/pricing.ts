import type { TicketRate } from './fourvenues/types';

/**
 * Cálculo del pedido. ÚNICA fuente de verdad del total que ve el usuario.
 * Todo en céntimos enteros. En la fase de compra real, el servidor recalcula con
 * los precios de Fourvenues y NUNCA se fía de este resultado (viene del cliente).
 */
export const MAX_PER_RATE = 10;

/** rateId -> cantidad */
export type Selection = Record<string, number>;

/** Agotada si la API la marca así O si el stock conocido es 0 (o negativo): nunca se puede comprar. */
export function isSoldOut(rate: TicketRate): boolean {
  return rate.soldOut || (rate.available !== null && rate.available <= 0);
}

/** Máximo seleccionable de una tarifa: 0 si agotada, si no el menor entre stock y tope por pedido. */
export function maxQty(rate: TicketRate): number {
  if (isSoldOut(rate)) return 0;
  return Math.max(0, Math.min(MAX_PER_RATE, rate.available ?? MAX_PER_RATE));
}

/**
 * Subtotal (sin gastos) de `qty` entradas de una tarifa. Si hay un siguiente tramo, solo las
 * primeras `remaining` entradas van al precio actual y el resto al del tramo siguiente,
 * para que el total mostrado no sea menor que el que se cobrará.
 */
export function lineSubtotalCents(rate: TicketRate, qty: number): number {
  const tier = rate.nextTier;
  if (!tier) return qty * rate.priceCents;
  const atCurrent = Math.min(qty, Math.max(0, tier.remaining));
  return atCurrent * rate.priceCents + (qty - atCurrent) * tier.priceCents;
}

/** Subtotal + gastos de `qty` entradas de una tarifa. */
export function lineTotalCents(rate: TicketRate, qty: number): number {
  return lineSubtotalCents(rate, qty) + qty * rate.feeCents;
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
    subtotalCents += lineSubtotalCents(rate, qty);
    feesCents += qty * rate.feeCents;
  }
  return { tickets, subtotalCents, feesCents, totalCents: subtotalCents + feesCents };
}
