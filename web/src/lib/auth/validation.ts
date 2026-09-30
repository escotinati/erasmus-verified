/**
 * Validación de los formularios de cuenta. Sin dependencias de servidor: se usa en el
 * cliente (botón desactivado hasta que sea válido, error junto al campo) y se REPITE en
 * el servidor, que es la que cuenta. Los límites reflejan los CHECK de `profiles`
 * (first_name ≤ 60): superarlos hace fallar el alta con un error genérico.
 */
export const NAME_MAX = 60;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bytes (bcrypt ignora lo que pase de 72)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type FieldErrors = Partial<Record<'name' | 'email' | 'password', string>>;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'Escribe tu correo.';
  if (email.length > 254 || !EMAIL_RE.test(email)) return 'Revisa el formato del correo.';
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Escribe una contraseña.';
  if (value.length < PASSWORD_MIN) return `Mínimo ${PASSWORD_MIN} caracteres.`;
  // bcrypt trunca a 72 BYTES: medimos bytes, no caracteres (los acentos/emojis ocupan más).
  if (new TextEncoder().encode(value).length > PASSWORD_MAX) return `Demasiado larga (máx. ${PASSWORD_MAX} bytes; acentos y emojis cuentan más).`;
}

export function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'Escribe tu nombre.';
  if (name.length > NAME_MAX) return `Máximo ${NAME_MAX} caracteres.`;
}

/** Rutas de cuenta que no tienen sentido como destino tras entrar (evita bucles /login → /login). */
const NEXT_BLOCKED = ['/login', '/registro', '/auth'];

/**
 * Solo rutas internas. Se valida por PARSEO, no por prefijo: el navegador y `new URL` eliminan
 * tabuladores y saltos de línea, así que `/%09/evil.com` o `/\t/evil.com` se convierten en
 * `//evil.com`. Devolvemos únicamente lo parseado (ruta + query), nunca el valor original.
 */
export function safeNextPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || /[\u0000-\u001f\u007f\s\\]/.test(value) || !value.startsWith('/') || value.startsWith('//')) {
    return fallback;
  }
  try {
    const base = 'http://internal.invalid';
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    if (NEXT_BLOCKED.some((p) => url.pathname === p || url.pathname.startsWith(`${p}/`))) return fallback;
    return url.pathname + url.search;
  } catch {
    return fallback;
  }
}
