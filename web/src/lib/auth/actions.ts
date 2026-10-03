'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DEFAULT_NEXT, NEXT_COOKIE, safeNextPath, validateEmail, validateName, validatePassword, type FieldErrors } from './validation';

export type AuthState = { errors?: FieldErrors; message?: string; sent?: boolean; email?: string };

/** Dominios de producción propios. Los previews de Vercel se añaden desde variables del sistema. */
const PROD_HOSTS = ['erasmusparties.org', 'www.erasmusparties.org', 'erasmusverified.com', 'www.erasmusverified.com'];

/**
 * URL base para el enlace del correo. NO se fía de las cabeceras: `Host`/`X-Forwarded-Host`
 * las controla quien llame a la Server Action, así que solo se acepta un host de la lista
 * cerrada (producción, localhost y el propio despliegue de Vercel); si no, un valor fijo.
 * (Supabase además valida contra su lista de Redirect URLs: allí, sin comodines abiertos.)
 */
async function getOrigin() {
  const trusted = new Set([
    ...PROD_HOSTS,
    'localhost:3000',
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ].filter((h): h is string => Boolean(h)));

  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  if (trusted.has(host)) {
    return `${host.startsWith('localhost') ? 'http' : 'https'}://${host}`;
  }
  return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? 'erasmusparties.org'}`;
}

const text = (form: FormData, key: string) => String(form.get(key) ?? '');

export async function signUpAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const name = text(form, 'name').trim();
  const email = text(form, 'email').trim();
  const password = text(form, 'password');
  const next = safeNextPath(text(form, 'next'), DEFAULT_NEXT);

  const errors: FieldErrors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };
  if (errors.name || errors.email || errors.password) return { errors, email };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // El trigger handle_new_user lee first_name de aquí. No enviamos city_id (es opcional).
      // Con otro nombre de clave el dato se pierde en silencio.
      data: { first_name: name },
      // Debe estar en Authentication → URL Configuration → Redirect URLs.
      emailRedirectTo: `${await getOrigin()}/auth/callback`,
    },
  });

  if (error) {
    // Solo el código (sin correo ni datos personales) para poder depurar en los logs del servidor.
    console.error('[auth] signUp falló:', error.code ?? error.status ?? error.name);
    // Límite de envío de correos: no revela nada sobre cuentas, así que se puede ser específico.
    if (error.code === 'over_email_send_rate_limit') {
      return { message: 'Hay mucha demanda ahora mismo. Espera unos minutos y vuelve a intentarlo.', email };
    }
    // Resto de errores: mensaje genérico. (Con "Confirm email" activo, un correo ya registrado no da
    // error: Supabase responde igual que a un alta nueva, para no revelar qué cuentas existen.)
    return { message: 'No hemos podido crear la cuenta. Inténtalo de nuevo en unos minutos.', email };
  }
  // Si Supabase devolviera sesión (confirmación de correo desactivada en el dashboard), entramos.
  if (data.session) redirect(next);
  // Con confirmación activada no hay sesión hasta pulsar el enlace del correo: recordamos a dónde volver
  // (p. ej. el resumen de compra). Solo rutas internas ya validadas; caduca en 1 h y solo viaja a /auth.
  const jar = await cookies();
  if (next !== DEFAULT_NEXT) {
    jar.set(NEXT_COOKIE, next, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/auth',
      maxAge: 60 * 60,
    });
  } else {
    // Un alta sin destino no debe heredar el de un intento anterior sin confirmar.
    jar.delete({ name: NEXT_COOKIE, path: '/auth' });
  }
  return { sent: true, email };
}

export async function signInAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, 'email').trim();
  const password = text(form, 'password');
  const next = safeNextPath(text(form, 'next'), DEFAULT_NEXT);

  const errors: FieldErrors = { email: validateEmail(email), password: password ? undefined : 'Escribe tu contraseña.' };
  if (errors.email || errors.password) return { errors, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // No confirmar si el correo existe. "Sin confirmar" solo lo devuelve Supabase con la contraseña correcta,
    // así que distinguirlo no permite averiguar qué correos tienen cuenta.
    const unconfirmed = error.code === 'email_not_confirmed';
    return {
      message: unconfirmed
        ? 'Confirma tu correo con el enlace que te enviamos y vuelve a entrar.'
        : 'Correo o contraseña incorrectos.',
      email,
    };
  }
  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
