import 'server-only';
import { mockAdapter } from './mock';
import type { TicketsAdapter } from './types';

/**
 * Punto único de acceso a la ticketera. La UI importa SOLO `tickets` de aquí.
 * `server-only` impide que este módulo (y la futura API key) llegue al navegador.
 *
 * FOURVENUES_ADAPTER=mock (por defecto) -> datos simulados.
 * El adapter real (channel-manager.ts) se añadirá al recibir la clave alpha.
 */
function createAdapter(): TicketsAdapter {
  if ((process.env.FOURVENUES_ADAPTER ?? 'mock') === 'mock') return mockAdapter;
  throw new Error('Adapter real de Fourvenues aún no implementado (falta clave alpha).');
}

export const tickets: TicketsAdapter = createAdapter();
export type { NightEvent, TicketRate, TicketsAdapter } from './types';
