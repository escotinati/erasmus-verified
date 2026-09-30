import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth/validation';

/**
 * Destino del enlace del correo de confirmación (flujo PKCE): llega con ?code=… y se
 * canjea por una sesión. Si el enlace se abre en otro navegador/dispositivo que el del
 * registro, el canje falla (falta el verificador guardado en cookie) aunque el correo SÍ
 * queda confirmado: mandamos a /login con un aviso en lugar de un error.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const next = safeNextPath(searchParams.get('next'), '/cuenta');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }
  return NextResponse.redirect(new URL('/login?aviso=confirmado', request.url));
}
