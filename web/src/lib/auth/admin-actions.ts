'use server';

import { notFound, redirect } from 'next/navigation';
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

/** Estado del alta: el QR y el secreto solo existen mientras dura la pantalla (nunca se guardan en el cliente). */
export type EnrollState = { message?: string; qrCode?: string; secret?: string };

const ENROLL_PATH = '/admin/activar-2fa';

/**
 * Comprueba que quien llama es un admin SIN segundo factor verificado. Es la única puerta del alta:
 * - anónimo → login; no admin → 404; ya con AAL2 → panel.
 * - Con un factor verificado se rechaza SIEMPRE (aunque la sesión sea AAL1): añadir un segundo factor sin pasar
 *   el primero permitiría a quien robe la contraseña saltarse el 2FA. Supabase lo impone también por su lado.
 */
async function requireEnrollableAdmin() {
  const supabase = await createClient();
  const { status } = await getAdminStatus(supabase);
  if (status === 'anonymous') redirect(`/login?next=${encodeURIComponent(ENROLL_PATH)}`);
  if (status === 'not-admin') notFound();
  if (status === 'ok') redirect('/admin');

  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (factors?.totp.some((f) => f.status === 'verified')) redirect('/admin/verificar');
  // `all` incluye los factores aún sin verificar (`totp` solo trae los verificados).
  const pending = (factors?.all ?? []).filter((f) => f.factor_type === 'totp' && f.status !== 'verified');
  return { supabase, pending };
}

/**
 * Paso 1: genera el secreto y el QR. Antes borra cualquier alta a medias (factor sin verificar) para no
 * acumularlos ni chocar con el nombre. El factor queda SIN verificar hasta que se confirma un código.
 */
export async function startAdminEnrollAction(): Promise<EnrollState> {
  const { supabase, pending } = await requireEnrollableAdmin();
  for (const f of pending) {
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: f.id });
    if (unenrollError) {
      console.error('[admin] borrar alta MFA a medias falló:', unenrollError.code ?? unenrollError.status ?? unenrollError.name);
      return { message: 'No hemos podido reiniciar el alta anterior. Inténtalo de nuevo en unos minutos.' };
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    issuer: 'Erasmus Parties', // nombre con el que aparece en la app de autenticación
    friendlyName: 'Panel de administrador',
  });
  // Solo se pinta un QR en formato SVG de datos; cualquier otra cosa se descarta. El SVG viene sin codificar
  // (con `#`, comillas…): se recodifica entero para que la URL de datos no se corte.
  const svg = data?.totp.qr_code.slice((data?.totp.qr_code.indexOf(',') ?? -1) + 1) ?? '';
  if (error || !data?.totp.qr_code.startsWith('data:image/svg+xml') || !/^\s*(<\?xml[^>]*>\s*)?<svg[\s>]/.test(svg)) {
    console.error('[admin] alta MFA falló:', error?.code ?? error?.status ?? error?.name ?? 'qr no válido');
    return { message: 'No hemos podido generar el código QR. Inténtalo de nuevo en unos minutos.' };
  }
  return { qrCode: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, secret: data.totp.secret };
}

/**
 * Paso 2: confirma el alta con el primer código de la app. El factor sale SIEMPRE del servidor (el último sin
 * verificar de esta sesión), nunca del formulario. Al verificarse, la sesión sube a AAL2.
 */
export async function confirmAdminEnrollAction(_prev: MfaState, form: FormData): Promise<MfaState> {
  const code = String(form.get('code') ?? '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(code)) return { message: 'Escribe el código de 6 dígitos de tu app de autenticación.' };

  const { supabase, pending } = await requireEnrollableAdmin();
  const factor = pending[pending.length - 1];
  if (!factor) return { message: 'Este QR ya no es válido. Pulsa «Generar código QR» otra vez.' };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) {
    console.error('[admin] confirmación MFA falló:', error.code ?? error.status ?? error.name);
    return { message: 'Código incorrecto o caducado. Comprueba que la hora de tu móvil es automática e inténtalo de nuevo.' };
  }
  redirect('/admin');
}
