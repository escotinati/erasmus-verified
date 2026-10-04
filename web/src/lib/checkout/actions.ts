'use server';

import { redirect } from 'next/navigation';
import { getFirstName, requireUser } from '@/lib/auth/session';
import { encodeSelection } from '@/lib/selection';
import { MissingServiceKeyError } from '@/lib/supabase/admin';
import { loadCheckout } from './load';
import { createOrder } from './orders';
import { isSimulatedCheckoutAllowed } from './simulation';

const text = (form: FormData, key: string) => String(form.get(key) ?? '');

/**
 * PAGO SIMULADO. No cobra nada ni emite entradas, pero SÍ guarda un pedido real (provider
 * 'simulated', estado 'paid') para que "Mis entradas" y la pantalla de éxito lean datos de verdad.
 * Se comporta como el pago real: exige sesión, revalida la selección contra las tarifas y recalcula
 * el total en el servidor. El importe que vio el usuario (`total`) solo sirve para detectar que
 * cambió; nunca se usa para cobrar ni se guarda.
 */
export async function payAction(form: FormData): Promise<void> {
  const slug = text(form, 'slug');
  const rawT = text(form, 't');
  // Sesión lo primero: un anónimo no llega a consultar nada. `next` solo es una ruta nuestra;
  // el login la revalida con safeNextPath y, si no es válida, usa el destino por defecto.
  const { supabase, user } = await requireUser(
    `/eventos/${encodeURIComponent(slug)}/pagar?t=${encodeURIComponent(rawT)}`,
  );
  if (!(await isSimulatedCheckoutAllowed())) redirect('/');

  const checkout = await loadCheckout(slug, rawT);
  if (checkout.status === 'no-event') redirect('/');
  if (checkout.status === 'no-selection') redirect(`/eventos/${checkout.event.slug}`);

  const { event, selection, summary } = checkout;
  const t = encodeSelection(selection);

  // Si el precio cambió entre la pantalla de pago y el envío, no se cobra a ciegas: se vuelve a avisar.
  const seen = Number(text(form, 'total'));
  if (!Number.isInteger(seen) || seen !== summary.totalCents) {
    redirect(`/eventos/${event.slug}/pagar?t=${t}&cambio=1`);
  }

  // El pedido se escribe con la secret key, pero solo aquí, ya con el usuario verificado (getUser).
  // redirect() lanza una excepción interna: no puede ir dentro del try.
  let orderId: string;
  try {
    orderId = await createOrder({
      user,
      event,
      selection,
      summary,
      buyerFirstName: await getFirstName(supabase, user),
      status: 'paid',
      provider: 'simulated',
    });
  } catch (error) {
    console.error('[payAction] No se pudo guardar el pedido:', error instanceof Error ? error.message : 'error desconocido');
    const code = error instanceof MissingServiceKeyError ? 'config' : 'guardar';
    redirect(`/eventos/${event.slug}/pagar?t=${t}&error=${code}`);
  }

  redirect(`/eventos/${event.slug}/exito?pedido=${orderId}`);
}
