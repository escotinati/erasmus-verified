import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';
import { EXPERIENCE_COOKIE, EXPERIENCE_HEADER, isProductionHost, resolveExperience } from '@/lib/experience';

/**
 * Next.js 16: "proxy" sustituye a "middleware".
 * Resuelve la experiencia (parties/verified) por hostname y la pasa a los
 * Server Components mediante una cabecera de petición interna, y refresca la sesión de Supabase.
 */
export async function proxy(request: NextRequest) {
  const host = request.headers.get('host');
  const queryOverride = request.nextUrl.searchParams.get('exp');
  const override = queryOverride ?? request.cookies.get(EXPERIENCE_COOKIE)?.value;

  const experience = resolveExperience(host, override);

  // Se sobrescribe siempre: un cliente no puede colar su propia cabecera x-experience.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(EXPERIENCE_HEADER, experience);

  // Refresca la sesión de Supabase (si la hay) conservando la cabecera x-experience.
  const response = await updateSession(request, requestHeaders);

  // Persistimos ?exp= entre páginas solo fuera de producción.
  if (queryOverride && !isProductionHost(host)) {
    response.cookies.set(EXPERIENCE_COOKIE, experience, { path: '/', sameSite: 'lax' });
  }
  return response;
}

export const config = {
  // Todo menos estáticos y assets internos de Next.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
