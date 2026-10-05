import type { NightEvent } from '@/lib/fourvenues';

/**
 * Separa la noche destacada del resto. Destacada = mayor `priority` (solo si es > 0); a igualdad,
 * la que empieza antes. El resto conserva el orden recibido (cronológico). Sin ninguna con prioridad,
 * no hay destacada: el listado es una rejilla uniforme.
 */
export function pickFeatured(events: NightEvent[]): { featured: NightEvent | null; rest: NightEvent[] } {
  let featured: NightEvent | null = null;
  for (const event of events) {
    if (event.priority <= 0) continue;
    const better =
      !featured ||
      event.priority > featured.priority ||
      (event.priority === featured.priority && Date.parse(event.startsAt) < Date.parse(featured.startsAt));
    if (better) featured = event;
  }
  return { featured, rest: featured ? events.filter((e) => e !== featured) : events };
}
