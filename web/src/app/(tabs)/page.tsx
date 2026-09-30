import { CityFilter } from '@/components/CityFilter';
import { EventCard } from '@/components/EventCard';
import { tickets } from '@/lib/fourvenues';
import { getExperience } from '@/lib/get-experience';

type Props = { searchParams: Promise<{ ciudad?: string | string[] }> };

export default async function NochesPage({ searchParams }: Props) {
  const [experience, all, sp] = await Promise.all([getExperience(), tickets.listEvents(), searchParams]);

  const cities = [...new Set(all.map((e) => e.city))].sort((a, b) => a.localeCompare(b, 'es'));
  // Solo se acepta una ciudad conocida: cualquier otro valor de la URL se ignora.
  const requested = Array.isArray(sp.ciudad) ? sp.ciudad[0] : sp.ciudad;
  const city = requested && cities.includes(requested) ? requested : null;
  const events = city ? all.filter((e) => e.city === city) : all;

  return (
    <main className="container" style={{ paddingTop: 24, display: 'grid', gap: 16 }}>
      <header>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.875rem' }}>
          {experience === 'parties' ? 'Erasmus Parties' : 'Erasmus Verified'}
        </p>
        <h1 style={{ fontFamily: 'var(--font-hero)', fontSize: '2rem' }}>Noches</h1>
      </header>

      <CityFilter cities={cities} active={city} />

      {events.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Ahora mismo no hay noches disponibles. Vuelve pronto.</p>
      ) : (
        events.map((event) => <EventCard key={event.id} event={event} />)
      )}
    </main>
  );
}
