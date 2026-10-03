import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventMedia } from '@/components/EventMedia';
import { Icon, type IconName } from '@/components/Icon';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';
import { TicketSelector } from '@/components/TicketSelector';
import { loadEvent } from '@/lib/events';
import { formatEventDay, formatTimeRange } from '@/lib/format';
import styles from './ficha.module.css';

type Props = { params: Promise<{ slug: string }> };

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

export default async function FichaPage({ params }: Props) {
  const { slug } = await params;
  const event = await loadEvent(slug);
  if (!event) notFound();

  return (
    <>
      <EventMedia event={event} className={styles.hero}>
        <BackButton overlay label="Volver a las noches" />
        {event.minAge !== null && (
          <Badge variant="solid" className={styles.age}>
            +{event.minAge}
          </Badge>
        )}
      </EventMedia>

      <main className={styles.main}>
        <div className={styles.head}>
          <h1 className={styles.title}>{event.name}</h1>
          <p className={styles.sub}>
            {event.venueName} · {event.city}
          </p>
        </div>

        <Fact icon="calendar" title={formatEventDay(event.startsAt)} detail={formatTimeRange(event.startsAt, event.endsAt)} />
        <Fact icon="pin" title={event.venueName} detail={event.address ?? undefined} />
        {event.minAge !== null && (
          <Fact icon="id" title={`Solo mayores de ${event.minAge}`} detail="Lleva DNI o pasaporte" />
        )}
        {event.genres.length > 0 && <Fact icon="music" title={event.genres.join(' · ')} />}

        <h2 className={styles.h2}>Entradas</h2>
        <TicketSelector slug={event.slug} rates={event.rates} />
      </main>
    </>
  );
}
