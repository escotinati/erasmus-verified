import { CityFilter } from '@/components/CityFilter';
import { EventCard } from '@/components/EventCard';
import { FeaturedEventCard } from '@/components/FeaturedEventCard';
import { pickFeatured } from '@/lib/featured';
import { tickets } from '@/lib/fourvenues';
import { getExperience } from '@/lib/get-experience';
import styles from './noches.module.css';

type Props = { searchParams: Promise<{ ciudad?: string | string[] }> };

export default async function NochesPage({ searchParams }: Props) {
  const [experience, all, sp] = await Promise.all([getExperience(), tickets.listEvents(), searchParams]);

  const cities = [...new Set(all.map((e) => e.city))].sort((a, b) => a.localeCompare(b, 'es'));
  // Solo se acepta una ciudad conocida: cualquier otro valor de la URL se ignora.
  const requested = Array.isArray(sp.ciudad) ? sp.ciudad[0] : sp.ciudad;
  const city = requested && cities.includes(requested) ? requested : null;
  const events = city ? all.filter((e) => e.city === city) : all;
  const { featured, rest } = pickFeatured(events);

  return (
    <main className={`wide ${styles.main}`}>
      <header>
        <p className={styles.brand}>{experience === 'parties' ? 'Erasmus Parties' : 'Erasmus Verified'}</p>
        <h1 className={styles.title}>
          Tu próxima
          <br />
          <span className={styles.accent}>noche Erasmus</span>
        </h1>
        <p className={styles.lead}>
          {events.length} {events.length === 1 ? 'noche' : 'noches'} {city ? `en ${city}` : 'en todas las ciudades'}
        </p>
      </header>

      <CityFilter cities={cities} active={city} />

      {events.length === 0 ? (
        <p className={styles.empty}>Ahora mismo no hay noches disponibles. Vuelve pronto.</p>
      ) : (
        <div className={styles.grid}>
          {featured && (
            <div className={styles.featured}>
              <FeaturedEventCard event={featured} />
            </div>
          )}
          {rest.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}
