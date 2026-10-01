import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import type { NightEvent } from '@/lib/fourvenues';
import { formatEuros, formatEventDate } from '@/lib/format';
import styles from './EventCard.module.css';

/** Tres degradados de marca; el evento elige uno de forma estable (siempre el mismo para el mismo slug). */
const TONES = [styles.tone0, styles.tone1, styles.tone2] as const;
function toneFor(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

/** Tarjeta de evento: imagen (o degradado de respaldo) + datos. Precio "desde" = tarifa disponible más barata. */
export function EventCard({ event }: { event: NightEvent }) {
  const available = event.rates.filter((r) => !r.soldOut);
  const fromCents = available.length ? Math.min(...available.map((r) => r.priceCents)) : null;
  // Solo https: nunca se pinta una URL de origen desconocido con otro esquema.
  const image = event.imageUrl?.startsWith('https://') ? event.imageUrl : null;

  return (
    <Link href={`/eventos/${event.slug}`} className={styles.card}>
      <div className={`${styles.media} ${toneFor(event.slug)}`}>
        {image && <img src={image} alt="" loading="lazy" className={styles.image} />}
        <Badge variant="solid" className={styles.date}>
          {formatEventDate(event.startsAt)}
        </Badge>
      </div>
      <div className={styles.body}>
        <h2 className={styles.title}>{event.name}</h2>
        <p className={styles.meta}>
          {event.venueName} · {event.city}
        </p>
        <p className={styles.price}>
          {fromCents === null ? <span className={styles.soldOut}>Agotado</span> : <>Desde {formatEuros(fromCents)}</>}
        </p>
      </div>
    </Link>
  );
}
