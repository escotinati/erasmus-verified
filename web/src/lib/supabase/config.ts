import type { CookieOptions } from '@supabase/ssr';

/**
 * Variables públicas de Supabase (URL y anon key: públicas por diseño, protegidas por RLS).
 * Falla pronto y claro si faltan. La secret key (service_role) vive aparte, en admin.ts, solo para pedidos.
 */
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (ver web/.env.example).');
  }
  return { url, anonKey };
}

/**
 * Endurece las cookies de sesión. @supabase/ssr las deja legibles por JS (httpOnly: false)
 * porque asume un cliente de navegador; aquí TODA la auth va por servidor, así que no hace
 * falta y, con la CSP actual ('unsafe-inline'), reduce el daño de un posible XSS.
 * Si algún día se añade un cliente de navegador de Supabase, esto hay que revisarlo.
 */
export function hardenCookie(options: CookieOptions): CookieOptions {
  return { ...options, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' };
}
