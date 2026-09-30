'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath, validateEmail, validateName, validatePassword, type FieldErrors } from './validation';

export type AuthState = { errors?: FieldErrors; message?: string; sent?: boolean; email?: string };

/** URL base de esta petición (localhost, preview o dominio de producción), para el enlace del correo. */
async function getOrigin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

const text = (form: FormData, key: string) => String(form.get(key) ?? '');

export async function signUpAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const name = text(form, 'name').trim();
  const email = text(form, 'email').trim();
  const password = text(form, 'password');

  const errors: FieldErrors = {
    name: validateName(name),
    email: validateEmail(email),
    password: validatePassword(password),
  };
  if (errors.name || errors.email || errors.password) return { errors, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
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
    // Mensaje genérico: no revelamos detalles internos. (Un correo ya registrado no da error:
    // Supabase protege contra la enumeración de usuarios y responde igual que un alta nueva.)
    return { message: 'No hemos podido crear la cuenta. Inténtalo de nuevo en unos minutos.', email };
  }
  // Con confirmación de correo activada no hay sesión hasta pulsar el enlace.
  return { sent: true, email };
}

export async function signInAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = text(form, 'email').trim();
  const password = text(form, 'password');
  const next = safeNextPath(text(form, 'next'), '/cuenta');

  const errors: FieldErrors = { email: validateEmail(email), password: password ? undefined : 'Escribe tu contraseña.' };
  if (errors.email || errors.password) return { errors, email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    // Mensaje único: no confirmar si el correo existe ni distinguir "sin confirmar" de "clave mala".
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
