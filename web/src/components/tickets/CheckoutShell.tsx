import type { ReactNode } from 'react';
import { BackButton } from '@/components/ui/BackButton';
import { formatEventDay, formatTimeRange } from '@/lib/format';
import type { NightEvent } from '@/lib/fourvenues/types';
import styles from './CheckoutShell.module.css';

/** Esqueleto común de las pantallas de compra (resumen, pago, éxito): cabecera con volver + título. */
export function CheckoutShell({ title, back, children }: { title: string; back?: { href: string; label: string }; children: ReactNode }) {
  return (
    <main className={styles.main}>
      <div className={styles.top}>
        {back && <BackButton href={back.href} label={back.label} />}
        <h1 className={styles.title}>{title}</h1>
      </div>
      {children}
    </main>
  );
}

/** Tarjeta con los datos del evento. */
export function EventSummary({ event }: { event: NightEvent }) {
  return (
    <section className={styles.event} aria-label="Evento">
      <h2 className={styles.eventName}>{event.name}</h2>
      <p className={styles.eventMeta}>
        {formatEventDay(event.startsAt)} · {formatTimeRange(event.startsAt, event.endsAt)}
      </p>
      <p className={styles.eventMeta}>
        {event.venueName} · {event.city}
      </p>
    </section>
  );
}

/** Aviso destacado. `live`: se anuncia a lectores de pantalla (solo para avisos que informan de un cambio). */
export function CheckoutNotice({ children, live = false }: { children: ReactNode; live?: boolean }) {
  return (
    <p className={styles.notice} role={live ? 'status' : undefined}>
      {children}
    </p>
  );
}
