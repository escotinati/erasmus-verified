import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseConfig } from './config';

/** ¿Trae la petición cookies de sesión de Supabase? (sb-<ref>-auth-token[.n]) */
function hasSessionCookie(request: NextRequest) {
  return request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
}

/**
 * Refresca la sesión (renueva el token caducado y reescribe las cookies).
 * Devuelve la respuesta a usar. `requestHeaders` son las cabeceras internas del proxy
 * (x-experience) y deben viajar también en la respuesta que devolvemos aquí.
 *
 * Importante: esto NO protege rutas. La comprobación de acceso se hace en cada página
 * de servidor (getUser), porque el proxy no es una barrera de seguridad suficiente.
 */
export async function updateSession(request: NextRequest, requestHeaders: Headers) {
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  // Sin cookies de sesión no hay nada que refrescar: no penalizamos el catálogo público.
  if (!hasSessionCookie(request)) return response;

  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // No poner código entre createServerClient y getClaims (podría cerrar sesiones al azar).
  await supabase.auth.getClaims();
  return response;
}
