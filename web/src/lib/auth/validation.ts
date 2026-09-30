/**
 * Validación de los formularios de cuenta. Sin dependencias de servidor: se usa en el
 * cliente (botón desactivado hasta que sea válido, error junto al campo) y se REPITE en
 * el servidor, que es la que cuenta. Los límites reflejan los CHECK de `profiles`
 * (first_name ≤ 60): superarlos hace fallar el alta con un error genérico.
 */
export const NAME_MAX = 60;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72; // bcrypt ignora lo que pase de 72 bytes

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
  if (value.length > PASSWORD_MAX) return `Máximo ${PASSWORD_MAX} caracteres.`;
}

export function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'Escribe tu nombre.';
  if (name.length > NAME_MAX) return `Máximo ${NAME_MAX} caracteres.`;
}

/** Solo rutas internas: evita el open redirect (`//evil.com`, `https://…`, `/\evil.com`). */
export function safeNextPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}
