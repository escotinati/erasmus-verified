import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventMedia } from '@/components/EventMedia';
import { Icon, type IconName } from '@/components/Icon';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';
import { TicketSelector } from '@/components/TicketSelector';
import { loadEvent } from '@/lib/events';
import { formatEventDay, formatTimeRange } from '@/lib/format';
import { parseSelection } from '@/lib/selection';
import styles from './ficha.module.css';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await loadEvent(slug);
  return { title: event ? event.name : 'Noche no encontrada' };
}

function Fact({ icon, title, detail }: { icon: IconName; title: string; detail?: string }) {
  return (
    <div className={styles.fact}>
      <span className={styles.factIcon}>
        <Icon name={icon} />
      </span>
      <div>
        <div className={styles.factTitle}>{title}</div>
        {detail && <div className={styles.factDetail}>{detail}</div>}
      </div>
    </div>
  );
}

export default async function FichaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { t } = await searchParams;
  const event = await loadEvent(slug);
  if (!event) notFound();

  // Al volver desde el resumen (?t=…) se recupera la selección; el servidor la valida igual que allí.
  const { selection } = parseSelection(typeof t === 'string' ? t : undefined, event.rates);

  return (
    <main>
      <div className={styles.top}>
        <EventMedia event={event} className={styles.hero}>
          <BackButton overlay text="Noches" label="Volver a las noches" />
          {event.minAge !== null && (
            <Badge variant="solid" className={styles.age}>
              +{event.minAge}
            </Badge>
          )}
        </EventMedia>
        <div className={styles.head}>
          <h1 className={styles.title}>{event.name}</h1>
          <p className={styles.sub}>
            {event.venueName} · {event.city}
          </p>
        </div>
      </div>

      <TicketSelector slug={event.slug} rates={event.rates} initialSelection={selection}>
        <section aria-label="Datos de la noche" className={styles.facts}>
          <Fact icon="calendar" title={formatEventDay(event.startsAt)} detail={formatTimeRange(event.startsAt, event.endsAt)} />
          <Fact icon="pin" title={event.venueName} detail={event.address ?? undefined} />
          {event.minAge !== null && (
            <Fact icon="id" title={`Solo mayores de ${event.minAge}`} detail="Lleva DNI o pasaporte" />
          )}
          {event.genres.length > 0 && <Fact icon="music" title={event.genres.join(' · ')} />}
        </section>
      </TicketSelector>
    </main>
  );
}
