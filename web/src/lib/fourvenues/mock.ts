import type { NightEvent, TicketsAdapter } from './types';

/**
 * Adapter SIMULADO. Datos ficticios (salas inventadas), fechas relativas a hoy
 * para que el catálogo nunca quede "en el pasado".
 */
const DAY = 24 * 60 * 60 * 1000;
const at = (days: number, hour: number) => {
  const d = new Date(Date.now() + days * DAY);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

const EVENTS: NightEvent[] = [
  {
    id: 'evt-001',
    slug: 'welcome-erasmus-party',
    name: 'Welcome Erasmus Party',
    venueName: 'Sala Ejemplo Uno',
    city: 'Bilbao',
    startsAt: at(3, 21),
    imageUrl: null,
    rates: [
      { id: 'rate-001a', name: 'Entrada + copa', priceCents: 800, available: 120, soldOut: false },
      { id: 'rate-001b', name: 'Entrada sola', priceCents: 500, available: 0, soldOut: true },
    ],
  },
  {
    id: 'evt-002',
    slug: 'international-night',
    name: 'International Night',
    venueName: 'Club Ejemplo Dos',
    city: 'Bilbao',
    startsAt: at(5, 22),
    imageUrl: null,
    rates: [{ id: 'rate-002a', name: 'Entrada general', priceCents: 1000, available: 60, soldOut: false }],
  },
  {
    id: 'evt-003',
    slug: 'thursday-latin-mix',
    name: 'Thursday Latin Mix',
    venueName: 'Sala Ejemplo Tres',
    city: 'Madrid',
    startsAt: at(8, 23),
    imageUrl: null,
    rates: [{ id: 'rate-003a', name: 'Entrada + copa', priceCents: 1200, available: 200, soldOut: false }],
  },
];

export const mockAdapter: TicketsAdapter = {
  async listEvents({ city, limit } = {}) {
    let list = EVENTS;
    if (city) list = list.filter((e) => e.city.toLowerCase() === city.toLowerCase());
    return list.slice(0, limit ?? list.length);
  },
  async getEventBySlug(slug) {
    return EVENTS.find((e) => e.slug === slug) ?? null;
  },
};
