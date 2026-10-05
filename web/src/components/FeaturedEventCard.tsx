import Link from 'next/link';
import { EventMedia } from '@/components/EventMedia';
import { Badge } from '@/components/ui/Badge';
import type { NightEvent } from '@/lib/fourvenues';
import { formatEuros, formatEventDate } from '@/lib/format';
import { lowestAvailablePriceCents } from '@/lib/pricing';
import styles from './FeaturedEventCard.module.css';

/**
 * Noche destacada del listado (la de mayor `priority`). Ocupa dos columnas en escritorio.
 * Toda la tarjeta es un enlace: el «botón» es un span (un <button> dentro de un <a> no es válido).
 */
export function FeaturedEventCard({ event }: { event: NightEvent }) {
  const fromCents = lowestAvailablePriceCents(event);

  return (
    <Link href={`/eventos/${event.slug}`} className={styles.card}>
      <EventMedia event={event} className={styles.media}>
        <Badge variant="solid" className={styles.date}>
          {formatEventDate(event.startsAt)}
        </Badge>
      </EventMedia>
      <div className={styles.body}>
        <div>
          <h2 className={styles.title}>{event.name}</h2>
          <p className={styles.meta}>
            {event.venueName} · {event.city}
          </p>
        </div>
        {fromCents === null ? (
          <span className={styles.soldOut}>Agotado</span>
        ) : (
          <span className={styles.cta}>Ver entradas · desde {formatEuros(fromCents)}</span>
        )}
      </div>
    </Link>
  );
}
