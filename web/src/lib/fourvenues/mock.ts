import type { NightEvent, TicketsAdapter } from './types';

/**
 * Adapter SIMULADO. Datos ficticios (salas inventadas), fechas relativas a hoy
 * para que el catálogo nunca quede "en el pasado".
 * Gastos: 10 % del precio (redondeado a céntimo) — solo para la maqueta.
 */
const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const fee = (priceCents: number) => Math.round(priceCents * 0.1);

const at = (days: number, hourUtc: number) => {
  const d = new Date(Date.now() + days * DAY);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d.toISOString();
};
const end = (startIso: string, hours: number) => new Date(new Date(startIso).getTime() + hours * HOUR).toISOString();

const START_1 = at(3, 21);
const START_2 = at(5, 22);
const START_3 = at(8, 23);

const EVENTS: NightEvent[] = [
  {
    id: 'evt-001',
    slug: 'welcome-erasmus-party',
    name: 'Welcome Erasmus Party',
    venueName: 'Sala Ejemplo Uno',
    address: '[Dirección de la sala]',
    city: 'Bilbao',
    startsAt: START_1,
    endsAt: end(START_1, 6),
    minAge: 18,
    genres: ['Reggaetón', 'Latino'],
    imageUrl: null,
    rates: [
      {
        id: 'rate-001a',
        name: 'General',
        priceCents: 800,
        feeCents: fee(800),
        available: 40,
        soldOut: false,
        badge: 'Early bird',
        includes: 'Incluye 1 copa',
        nextTier: { remaining: 40, priceCents: 1000 },
      },
      { id: 'rate-001b', name: 'General + pack copas', priceCents: 1500, feeCents: fee(1500), available: 0, soldOut: true },
    ],
  },
  {
    id: 'evt-002',
    slug: 'international-night',
    name: 'International Night',
    venueName: 'Club Ejemplo Dos',
    address: '[Dirección de la sala]',
    city: 'Bilbao',
    startsAt: START_2,
    endsAt: end(START_2, 6),
    minAge: 18,
    genres: ['Comercial', 'House'],
    imageUrl: null,
    rates: [
      { id: 'rate-002a', name: 'Entrada general', priceCents: 1000, feeCents: fee(1000), available: 60, soldOut: false },
    ],
  },
  {
    id: 'evt-003',
    slug: 'thursday-latin-mix',
    name: 'Thursday Latin Mix',
    venueName: 'Sala Ejemplo Tres',
    address: '[Dirección de la sala]',
    city: 'Madrid',
    startsAt: START_3,
    endsAt: end(START_3, 5),
    minAge: null,
    genres: ['Latino'],
    imageUrl: null,
    rates: [
      {
        id: 'rate-003a',
        name: 'Entrada + copa',
        priceCents: 1200,
        feeCents: fee(1200),
        available: 200,
        soldOut: false,
        includes: 'Incluye 1 copa',
      },
    ],
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
