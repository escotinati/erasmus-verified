import Link from 'next/link';
import styles from './CityFilter.module.css';

/** Filtro por ciudad mediante enlaces (?ciudad=). Sin JS de cliente: funciona y se comparte por URL. */
export function CityFilter({ cities, active }: { cities: string[]; active: string | null }) {
  if (cities.length < 2) return null;
  return (
    <nav className={styles.row} aria-label="Filtrar por ciudad">
      <Link href="/" className={styles.chip} aria-current={active === null ? 'true' : undefined}>
        Todas
      </Link>
      {cities.map((city) => (
        <Link
          key={city}
          href={`/?ciudad=${encodeURIComponent(city)}`}
          className={styles.chip}
          aria-current={active === city ? 'true' : undefined}
        >
          {city}
        </Link>
      ))}
    </nav>
  );
}
