import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from './config';

/**
 * Cliente de Supabase para Server Components, Server Actions y Route Handlers.
 * La sesión vive en cookies (las gestiona @supabase/ssr), no en localStorage.
 * Se crea uno nuevo por petición: nunca guardarlo en una variable global.
 */
export async function createClient() {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Desde un Server Component no se pueden escribir cookies: es normal.
          // El proxy ya refresca la sesión en cada petición.
        }
      },
    },
  });
}
