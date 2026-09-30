/**
 * Experiencia según dominio: un solo código, dos marcas.
 * Equivalente al experience.js de la web actual.
 *
 *  - erasmusparties.org  -> 'parties' (ocio / fiestas)
 *  - erasmusverified.com -> 'verified' (por defecto)
 *  - ?exp=parties|verified fuerza la experiencia SOLO fuera de los dominios de producción
 *    (previews *.vercel.app y local), para poder probar sin cambiar de dominio.
 */
export type Experience = 'parties' | 'verified';

export const EXPERIENCE_HEADER = 'x-experience';
export const EXPERIENCE_COOKIE = 'exp';

const PRODUCTION_HOSTS = ['erasmusparties.org', 'erasmusverified.com'];

const isExperience = (v: string | null | undefined): v is Experience =>
  v === 'parties' || v === 'verified';

/** Quita puerto y "www." y pasa a minúsculas. */
export function normalizeHost(host: string | null): string {
  return (host ?? '').split(':')[0].toLowerCase().replace(/^www\./, '');
}

export function isProductionHost(host: string | null): boolean {
  return PRODUCTION_HOSTS.includes(normalizeHost(host));
}

export function experienceFromHost(host: string | null): Experience {
  return normalizeHost(host).endsWith('erasmusparties.org') ? 'parties' : 'verified';
}

/**
 * Decide la experiencia de una petición.
 * @param override valor de ?exp= o de la cookie (ignorado en dominios de producción)
 */
export function resolveExperience(host: string | null, override?: string | null): Experience {
  if (!isProductionHost(host) && isExperience(override)) return override;
  return experienceFromHost(host);
}

export function parseExperience(value: string | null | undefined): Experience {
  return isExperience(value) ? value : 'verified';
}
