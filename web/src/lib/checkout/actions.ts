'use server';

import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { encodeSelection } from '@/lib/selection';
import { loadCheckout } from './load';
import { isSimulatedCheckoutAllowed } from './simulation';

const text = (form: FormData, key: string) => String(form.get(key) ?? '');

/**
 * PAGO SIMULADO (fase 4). No cobra nada, no guarda nada y no emite entradas: solo recorre el flujo.
 * Aun así se comporta como el real: exige sesión, revalida la selección contra las tarifas y
 * recalcula el total en el servidor. El importe que vio el usuario (`total`) solo sirve para
 * detectar que cambió; nunca se usa para cobrar.
 */
export async function payAction(form: FormData): Promise<void> {
  const slug = text(form, 'slug');
  const rawT = text(form, 't');
  // Sesión lo primero: un anónimo no llega a consultar nada. `next` solo es una ruta nuestra;
  // el login la revalida con safeNextPath y, si no es válida, usa el destino por defecto.
  await requireUser(`/eventos/${encodeURIComponent(slug)}/pagar?t=${encodeURIComponent(rawT)}`);
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

  redirect(`/eventos/${event.slug}/exito?t=${t}`);
}
