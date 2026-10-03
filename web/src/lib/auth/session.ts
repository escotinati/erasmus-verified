import 'server-only';
import type { User } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NAME_MAX } from './validation';

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Exige sesión. Usa getUser(), que valida el token contra Supabase (el proxy solo refresca la
 * cookie): es la ÚNICA comprobación de autorización válida, nunca getSession().
 * Sin sesión redirige al login y vuelve a `next`, que debe ser una ruta interna ya construida por
 * nosotros (el login la vuelve a validar con safeNextPath).
 */
export async function requireUser(next: string): Promise<{ supabase: Supabase; user: User }> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { supabase, user: data.user };
}

/** Nombre de pila para mostrar. Puede no haber ninguno (usuarios anteriores al trigger). */
export async function getFirstName(supabase: Supabase, user: User): Promise<string | null> {
  // RLS: solo devuelve la fila propia.
  const { data: profile } = await supabase.from('profiles').select('first_name').eq('id', user.id).maybeSingle();
  // user_metadata lo puede editar el propio usuario: solo como último recurso y acotado.
  const metaName = user.user_metadata?.first_name;
  return profile?.first_name || (typeof metaName === 'string' ? metaName.slice(0, NAME_MAX) : null) || null;
}
