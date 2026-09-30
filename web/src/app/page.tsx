import { EventCard } from '@/components/EventCard';
import { tickets } from '@/lib/fourvenues';
import { getExperience } from '@/lib/get-experience';

export default async function NochesPage() {
  const [experience, events] = await Promise.all([getExperience(), tickets.listEvents()]);

  return (
    <main className="container" style={{ paddingTop: 24, display: 'grid', gap: 16 }}>
      <header>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>
          {experience === 'parties' ? 'Erasmus Parties' : 'Erasmus Verified'}
        </p>
        <h1 style={{ fontFamily: 'var(--font-hero)', fontSize: '2rem' }}>Noches</h1>
      </header>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </main>
  );
}
