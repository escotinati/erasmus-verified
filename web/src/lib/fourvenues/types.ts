/**
 * Modelo de DOMINIO de erasmusparties (no el de Fourvenues).
 * La UI solo conoce estos tipos; el adapter real traducirá la respuesta del
 * Channel Manager a esta forma. Así, al llegar la clave, solo cambia un archivo.
 * Importes en céntimos (enteros) para no arrastrar errores de coma flotante.
 */
export interface TicketRate {
  id: string;
  name: string;
  /** Precio unitario en céntimos, sin gastos. */
  priceCents: number;
  /** Gastos de gestión por entrada, en céntimos. En el adapter real vendrán de pricing-info. */
  feeCents: number;
  /** Plazas disponibles; null = sin dato. */
  available: number | null;
  soldOut: boolean;
  /** Etiqueta corta de tramo, p. ej. "Early bird". */
  badge?: string;
  /** Qué incluye, p. ej. "Incluye 1 copa". */
  includes?: string;
  /** Si el precio sube al agotarse el tramo actual. */
  nextTier?: { remaining: number; priceCents: number };
}

export interface NightEvent {
  id: string;
  slug: string;
  name: string;
  venueName: string;
  address: string | null;
  city: string;
  /** ISO 8601 con zona horaria. */
  startsAt: string;
  endsAt: string;
  /** Edad mínima; null = sin restricción. */
  minAge: number | null;
  genres: string[];
  imageUrl: string | null;
  /**
   * Prioridad editorial (más alto = más visible; 0 = sin destacar). NO viene de Fourvenues: es dato
   * propio (se fijará en nuestra base de datos según criterio de negocio). El listado destaca la noche
   * con mayor prioridad. El adapter real deberá rellenarlo cruzando con esa tabla; sin dato, 0.
   */
  priority: number;
  rates: TicketRate[];
}

export interface TicketsAdapter {
  listEvents(params?: { city?: string; limit?: number }): Promise<NightEvent[]>;
  getEventBySlug(slug: string): Promise<NightEvent | null>;
}
