import type { ReactNode } from 'react';
import type { NightEvent } from '@/lib/fourvenues';
import styles from './EventMedia.module.css';

/** Tres degradados de marca; el evento elige uno de forma estable (siempre el mismo para el mismo slug). */
const TONES = [styles.tone0, styles.tone1, styles.tone2] as const;
function toneFor(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return TONES[hash % TONES.length];
}

/**
 * Zona visual de un evento: imagen real si la hay; si no, degradado de marca de respaldo.
 * La usan la tarjeta del listado y la cabecera de la ficha, así el evento se ve igual en las dos.
 * El alto y el padding los pone quien la usa (className); los hijos (insignias, botón de volver)
 * se colocan encima, con los extremos opuestos si hay dos.
 */
export function EventMedia({ event, className, children }: { event: NightEvent; className?: string; children?: ReactNode }) {
  // Solo https: nunca se pinta una URL de origen desconocido con otro esquema.
  const image = event.imageUrl?.startsWith('https://') ? event.imageUrl : null;
  return (
    <div className={[styles.media, toneFor(event.slug), className ?? ''].filter(Boolean).join(' ')}>
      {image && <img src={image} alt="" loading="lazy" className={styles.image} />}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
