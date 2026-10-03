import type { TicketRate } from './fourvenues/types';
import { MAX_PER_RATE, clampQty, type Selection } from './pricing';

/**
 * La selección de entradas viaja en la URL: `?t=rate-001a.2,rate-001b.1` (idTarifa.cantidad).
 * Es solo la intención del usuario: el servidor la valida contra las tarifas reales y
 * recalcula el total; nunca se fía de lo que venga aquí.
 */
const MAX_ENTRIES = 20;

/** Selección -> valor del parámetro `t` (solo cantidades > 0). */
export function encodeSelection(selection: Selection): string {
  return Object.entries(selection)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => `${encodeURIComponent(id)}.${qty}`)
    .join(',');
}

export interface ParsedSelection {
  /** Cantidades ya ajustadas a lo que se puede comprar ahora mismo. */
  selection: Selection;
  /** true si algo de lo pedido no existe, no está disponible o se ha tenido que reducir. */
  adjusted: boolean;
}

/** Valor de `t` -> selección validada contra las tarifas del evento. Tolera basura sin lanzar. */
export function parseSelection(raw: string | undefined, rates: TicketRate[]): ParsedSelection {
  const requested: Selection = {};
  let adjusted = false;
  const parts = (raw ?? '').split(',').filter(Boolean);
  if (parts.length > MAX_ENTRIES) adjusted = true;

  for (const part of parts.slice(0, MAX_ENTRIES)) {
    const dot = part.lastIndexOf('.');
    let id = '';
    try {
      id = decodeURIComponent(part.slice(0, Math.max(dot, 0)));
    } catch {
      adjusted = true;
      continue;
    }
    const qty = Number(part.slice(dot + 1));
    if (dot <= 0 || !Number.isInteger(qty) || qty < 1 || qty > MAX_PER_RATE || !rates.some((r) => r.id === id)) {
      adjusted = true;
      continue;
    }
    requested[id] = (requested[id] ?? 0) + qty;
  }

  const selection: Selection = {};
  for (const rate of rates) {
    const want = requested[rate.id] ?? 0;
    const got = clampQty(rate, want);
    if (got !== want) adjusted = true;
    if (got > 0) selection[rate.id] = got;
  }
  return { selection, adjusted };
}
