/**
 * Variables públicas de Supabase (URL y anon key: públicas por diseño, protegidas por RLS).
 * Falla pronto y claro si faltan; la service role key NO se usa nunca en `web/`.
 */
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (ver web/.env.example).');
  }
  return { url, anonKey };
}
