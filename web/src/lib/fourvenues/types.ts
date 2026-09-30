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
  /** Plazas disponibles; null = sin dato. */
  available: number | null;
  soldOut: boolean;
}

export interface NightEvent {
  id: string;
  slug: string;
  name: string;
  venueName: string;
  city: string;
  /** ISO 8601 con zona horaria. */
  startsAt: string;
  imageUrl: string | null;
  rates: TicketRate[];
}

export interface TicketsAdapter {
  listEvents(params?: { city?: string; limit?: number }): Promise<NightEvent[]>;
  getEventBySlug(slug: string): Promise<NightEvent | null>;
}
