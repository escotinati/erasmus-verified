import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth/validation';

/**
 * Destino del enlace del correo de confirmación (flujo PKCE): llega con ?code=… y se
 * canjea por una sesión. Si el enlace se abre en otro navegador/dispositivo que el del
 * registro, el canje falla (falta el verificador guardado en cookie) aunque el correo SÍ
 * queda confirmado: mandamos a /login con un aviso en lugar de un error.
 */
function redirectTo(request: NextRequest, path: string) {
  const url = request.nextUrl.clone();
  const target = new URL(path, 'http://internal.invalid');
  url.pathname = target.pathname;
  url.search = target.search;
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  // Supabase devuelve ?error_code=otp_expired (etc.) cuando el enlace ya no vale.
  const linkError = searchParams.get('error_code') ?? searchParams.get('error');
  const next = safeNextPath(searchParams.get('next'), '/cuenta');

  if (code && !linkError) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return redirectTo(request, next);
  }
  // Enlace caducado/usado, o abierto en otro navegador: el correo puede estar ya confirmado o no.
  return redirectTo(request, `/login?aviso=${linkError ? 'enlace' : 'confirmado'}`);
}
