import 'server-only';
import { headers } from 'next/headers';
import { isProductionHost } from '@/lib/experience';

/**
 * El pago SIMULADO solo funciona en local y en previews. En los dominios de producción está
 * apagado: ahí nadie debe poder "pagar" una compra que no existe. (El adapter real, en la fase 5,
 * sustituirá a esto; hasta entonces el flujo completo queda cerrado en producción.)
 */
export async function isSimulatedCheckoutAllowed(): Promise<boolean> {
  const h = await headers();
  return !isProductionHost(h.get('x-forwarded-host') ?? h.get('host'));
}
