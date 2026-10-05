import 'server-only';
import type { User } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * - anonymous: sin sesión.
 * - not-admin: sesión válida, pero la cuenta no está en `admins`.
 * - needs-mfa: es admin, pero la sesión aún no ha pasado el segundo factor (AAL1).
 * - ok: admin con segundo factor verificado (AAL2).
 */
export type AdminStatus = 'anonymous' | 'not-admin' | 'needs-mfa' | 'ok';

/**
 * Estado de admin de la sesión actual. Es la ÚNICA forma válida de autorizar el panel:
 * - getUser() valida el token contra Supabase (nunca getSession()).
 * - `is_admin()` (RPC, mismo `private.is_admin()` que usan las políticas RLS) decide si es admin, con el
 *   cliente del usuario: no usa service_role y no se puede falsear desde el navegador.
 * - AAL2 se exige además aquí: hoy ninguna política de base de datos lo exige.
 * Debe llamarse en CADA página y acción del panel: un layout no se vuelve a evaluar en las navegaciones del cliente.
 */
export async function getAdminStatus(supabase: Supabase): Promise<{ status: AdminStatus; user: User | null }> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { status: 'anonymous', user: null };

  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (isAdmin !== true) return { status: 'not-admin', user: data.user };

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return { status: aal?.currentLevel === 'aal2' ? 'ok' : 'needs-mfa', user: data.user };
}

/**
 * Exige admin con segundo factor. Sin sesión → login; no admin → 404 (no se revela que el panel existe);
 * admin sin segundo factor verificado → pantalla de verificación.
 */
export async function requireAdmin(): Promise<{ supabase: Supabase; user: User }> {
  const supabase = await createClient();
  const { status, user } = await getAdminStatus(supabase);
  if (status === 'anonymous') redirect(`/login?next=${encodeURIComponent('/admin')}`);
  if (status === 'not-admin') notFound();
  if (status === 'needs-mfa') redirect('/admin/verificar');
  return { supabase, user: user! };
}
