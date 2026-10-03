import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';
import { ButtonLink } from '@/components/ui/Button';
import { StatusScreen } from '@/components/ui/StatusScreen';
import { loadEvent } from '@/lib/events';
import { formatEuros, formatEventDay, formatTimeRange } from '@/lib/format';
import { lineTotalCents, summarize } from '@/lib/pricing';
import { createClient } from '@/lib/supabase/server';
import { encodeSelection, parseSelection } from '@/lib/selection';
import styles from './comprar.module.css';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug);
  // Pantalla de proceso, no de contenido: fuera de buscadores.
  return { title: event ? `Resumen · ${event.name}` : 'Noche no encontrada', robots: { index: false } };
}

/**
 * Resumen de la compra. La selección llega en la URL pero aquí se valida y se recalcula
 * contra las tarifas reales: lo que se muestra nunca sale de lo que diga el cliente.
 */
export default async function ComprarPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { t } = await searchParams;
  const event = await loadEvent(slug);
  if (!event) notFound();

  const raw = typeof t === 'string' ? t : undefined;
  const fichaHref = `/eventos/${event.slug}`;
  if (!raw) redirect(fichaHref);

  const { selection, adjusted } = parseSelection(raw, event.rates);
  const summary = summarize(event.rates, selection);

  if (summary.tickets === 0) {
    return (
      <StatusScreen title="Tu selección ya no está disponible" text="Las entradas que elegiste se han agotado o el enlace no es válido.">
        <ButtonLink href={fichaHref}>Volver a elegir entradas</ButtonLink>
      </StatusScreen>
    );
  }

  // Comprar exige cuenta. Se decide en el servidor con getUser() (valida el token contra Supabase;
  // el proxy solo refresca la sesión). Volvemos aquí con la selección ya validada, no con la cruda.
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const back = `/eventos/${event.slug}/comprar?t=${encodeSelection(selection)}`;
    redirect(`/login?next=${encodeURIComponent(back)}`);
  }

  const lines = event.rates.filter((rate) => selection[rate.id] > 0);

  return (
    <main className={styles.main}>
      <div className={styles.top}>
        <BackButton href={`${fichaHref}?t=${encodeSelection(selection)}`} label="Volver a elegir entradas" />
        <h1 className={styles.title}>Resumen</h1>
      </div>

      <section className={styles.event} aria-label="Evento">
        <h2 className={styles.eventName}>{event.name}</h2>
        <p className={styles.eventMeta}>
          {formatEventDay(event.startsAt)} · {formatTimeRange(event.startsAt, event.endsAt)}
        </p>
        <p className={styles.eventMeta}>
          {event.venueName} · {event.city}
        </p>
      </section>

      {adjusted && (
        <p className={styles.notice}>
          Hemos ajustado tu selección a las entradas disponibles ahora mismo. Revisa el total antes de seguir.
        </p>
      )}

      <section aria-label="Entradas elegidas">
        <ul className={styles.lines}>
          {lines.map((rate) => {
            const qty = selection[rate.id];
            return (
              <li key={rate.id} className={styles.line}>
                <div>
                  <div className={styles.lineName}>{rate.name}</div>
                  <div className={styles.note}>
                    {qty} {qty === 1 ? 'entrada' : 'entradas'}
                  </div>
                </div>
                <div className={styles.lineTotal}>{formatEuros(lineTotalCents(rate, qty))}</div>
              </li>
            );
          })}
        </ul>
      </section>

      <dl className={styles.totals}>
        <div className={styles.row}>
          <dt>Entradas</dt>
          <dd>{formatEuros(summary.subtotalCents)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Gastos de gestión</dt>
          <dd>{formatEuros(summary.feesCents)}</dd>
        </div>
        <div className={`${styles.row} ${styles.grand}`}>
          <dt>Total</dt>
          <dd>{formatEuros(summary.totalCents)}</dd>
        </div>
      </dl>

      <p className={styles.next}>El siguiente paso (tus datos y el pago) llega en la próxima fase.</p>
    </main>
  );
}
