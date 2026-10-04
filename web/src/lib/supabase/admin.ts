import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente de Supabase con la SECRET KEY (rol service_role): SALTA RLS. Solo para escribir pedidos.
 *
 * Reglas (todas importan):
 *  - Solo se usa DESPUÉS de comprobar la sesión con requireUser()/getUser(): el servidor decide
 *    quién es el usuario; esta clave nunca autoriza nada por sí sola.
 *  - Nunca se importa desde un Client Component (`server-only` rompe el build si pasa).
 *  - La variable NO lleva el prefijo NEXT_PUBLIC_: jamás debe llegar al navegador.
 *  - Se crea un cliente por llamada y sin sesión propia (no lee ni escribe cookies).
 *
 * La base de datos limita aun así lo que puede hacer (REVOKE): leer/insertar pedidos, actualizar solo
 * `status` y `provider_ref`, y ejecutar create_order(). No puede borrar nada.
 */
export class MissingServiceKeyError extends Error {
  constructor() {
    super(
      'Falta SUPABASE_SERVICE_ROLE_KEY (la secret key de Supabase, sb_secret_…). Sin ella no se pueden guardar pedidos. ' +
        'Añádela como variable de entorno SOLO de servidor: web/.env.local en local o Vercel -> Environment Variables (sin NEXT_PUBLIC_).',
    );
    this.name = 'MissingServiceKeyError';
  }
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new MissingServiceKeyError();
  if (!url) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL (ver web/.env.example).');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
