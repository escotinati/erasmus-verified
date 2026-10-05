'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminStatus } from './admin';

export type MfaState = { message?: string };

/**
 * Verifica el código TOTP de un admin y sube la sesión a AAL2. El factor sale SIEMPRE del servidor
 * (listFactors), nunca del formulario; solo se acepta un código de 6 dígitos.
 */
export async function verifyAdminMfaAction(_prev: MfaState, form: FormData): Promise<MfaState> {
  const code = String(form.get('code') ?? '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(code)) return { message: 'Escribe el código de 6 dígitos de tu app de autenticación.' };

  const supabase = await createClient();
  const { status } = await getAdminStatus(supabase);
  if (status === 'anonymous') redirect(`/login?next=${encodeURIComponent('/admin')}`);
  if (status !== 'needs-mfa') redirect('/admin');

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === 'verified');
  if (!factor) return { message: 'Tu cuenta no tiene verificación en dos pasos configurada.' };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) {
    // Sin detalles internos: solo el código para depurar.
    console.error('[admin] verificación MFA falló:', error.code ?? error.status ?? error.name);
    return { message: 'Código incorrecto o caducado. Inténtalo de nuevo.' };
  }
  redirect('/admin');
}
