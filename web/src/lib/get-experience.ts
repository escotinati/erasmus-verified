import { headers } from 'next/headers';
import { EXPERIENCE_HEADER, parseExperience, type Experience } from './experience';

/** Lee la experiencia resuelta por proxy.ts. Solo en Server Components. */
export async function getExperience(): Promise<Experience> {
  const h = await headers();
  return parseExperience(h.get(EXPERIENCE_HEADER));
}
