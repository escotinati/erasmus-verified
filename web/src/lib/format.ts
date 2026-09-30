/** Formato de importes y fechas en español. Zona fija para evitar desajustes servidor/cliente. */
export const formatEuros = (cents: number) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);

export const formatEventDate = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Madrid',
  }).format(new Date(iso));

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Jueves 1 de octubre" */
export const formatEventDay = (iso: string) =>
  capitalize(
    new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' }).format(
      new Date(iso),
    ),
  );

const hhmm = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Europe/Madrid' }).format(
    new Date(iso),
  );

/** "23:59 – 06:00" */
export const formatTimeRange = (startIso: string, endIso: string) => `${hhmm(startIso)} – ${hhmm(endIso)}`;
