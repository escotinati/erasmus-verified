import 'server-only';
import { cache } from 'react';
import { tickets } from '@/lib/fourvenues';

/** Slugs válidos: minúsculas, dígitos y guiones. Se valida antes de tocar el adapter (que acabará usándolo en una URL de la API). */
const SLUG_RE = /^[a-z0-9-]{1,100}$/;

/** Una sola consulta por petición, compartida entre generateMetadata y la página. */
export const loadEvent = cache(async (slug: string) => (SLUG_RE.test(slug) ? tickets.getEventBySlug(slug) : null));
