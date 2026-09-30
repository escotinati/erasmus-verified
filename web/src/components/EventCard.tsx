import Link from 'next/link';
import type { NightEvent } from '@/lib/fourvenues';
import { formatEuros, formatEventDate } from '@/lib/format';
import styles from './EventCard.module.css';

/** Tarjeta de evento. Precio "desde" = tarifa disponible más barata. */
export function EventCard({ event }: { event: NightEvent }) {
  const available = event.rates.filter((r) => !r.soldOut);
  const fromCents = available.length ? Math.min(...available.map((r) => r.priceCents)) : null;

  return (
    <Link href={`/eventos/${event.slug}`} className={styles.card}>
      <p className={styles.date}>{formatEventDate(event.startsAt)}</p>
      <h2 className={styles.title}>{event.name}</h2>
      <p className={styles.meta}>
        {event.venueName} · {event.city}
      </p>
      <p className={styles.price}>
        {fromCents === null ? <span className={styles.soldOut}>Agotado</span> : <>Desde {formatEuros(fromCents)}</>}
      </p>
    </Link>
  );
}
