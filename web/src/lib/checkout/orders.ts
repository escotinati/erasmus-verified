import 'server-only';
import type { User } from '@supabase/supabase-js';
import type { NightEvent } from '@/lib/fourvenues/types';
import { lineSubtotalCents, type OrderSummary, type Selection } from '@/lib/pricing';
import { createAdminClient } from '@/lib/supabase/admin';
import type { createClient } from '@/lib/supabase/server';

type UserClient = Awaited<ReturnType<typeof createClient>>;

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled';
export type OrderProvider = 'simulated' | 'fourvenues';

export interface OrderItem {
  rateId: string;
  rateName: string;
  qty: number;
  unitPriceCents: number;
  feeCents: number;
  lineSubtotalCents: number;
  lineTotalCents: number;
}

export interface Order {
  id: string;
  eventSlug: string;
  eventName: string;
  status: OrderStatus;
  provider: OrderProvider;
  subtotalCents: number;
  feesCents: number;
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
}

/** Id de pedido válido (uuid). Se comprueba antes de consultar: viene de la URL. */
export const isOrderId = (v: unknown): v is string =>
  typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/**
 * Guarda un pedido (cabecera + líneas) en UNA transacción vía create_order().
 * Las líneas salen de las tarifas REALES del evento y de la selección ya validada en el servidor;
 * los totales de la cabecera los calcula la base de datos sumando las líneas.
 * `expectedTotalCents` es el total que calculó el servidor: si la base de datos obtuviera otro,
 * algo no cuadra y se aborta antes de dar el pedido por bueno.
 */
export async function createOrder(args: {
  user: User;
  event: NightEvent;
  selection: Selection;
  summary: OrderSummary;
  buyerFirstName: string | null;
  status: OrderStatus;
  provider: OrderProvider;
}): Promise<string> {
  const { user, event, selection, summary, buyerFirstName, status, provider } = args;
  if (!user.email) throw new Error('El usuario no tiene email: no se puede crear el pedido.');

  const items = event.rates
    .filter((rate) => (selection[rate.id] ?? 0) > 0)
    .map((rate) => {
      const qty = selection[rate.id];
      return {
        rate_id: rate.id,
        rate_name: rate.name,
        qty,
        unit_price_cents: rate.priceCents,
        fee_cents: rate.feeCents,
        line_subtotal_cents: lineSubtotalCents(rate, qty),
      };
    });

  const admin = createAdminClient();
  const { data, error } = await admin.rpc('create_order', {
    p_user_id: user.id,
    p_event_slug: event.slug,
    p_event_name: event.name,
    p_buyer_email: user.email,
    p_buyer_first_name: buyerFirstName,
    p_status: status,
    p_provider: provider,
    p_provider_ref: null,
    p_items: items,
  });
  if (error || !isOrderId(data)) throw new Error(`create_order falló: ${error?.message ?? 'respuesta inesperada'}`);

  // Comprobación cruzada: el total guardado debe ser el que calculó el servidor.
  const { data: saved, error: checkError } = await admin.from('orders').select('total_cents').eq('id', data).single();
  if (checkError || saved?.total_cents !== summary.totalCents) {
    // No dejar un pedido 'paid' huérfano: se marca como fallido (único UPDATE permitido a la secret key).
    await admin.from('orders').update({ status: 'failed' }).eq('id', data);
    throw new Error(`El total guardado no coincide con el calculado (pedido ${data}); marcado como failed.`);
  }
  return data;
}

type OrderRow = {
  id: string;
  event_slug: string;
  event_name: string;
  status: OrderStatus;
  provider: OrderProvider;
  subtotal_cents: number;
  fees_cents: number;
  total_cents: number;
  created_at: string;
  order_items: {
    rate_id: string;
    rate_name: string;
    qty: number;
    unit_price_cents: number;
    fee_cents: number;
    line_subtotal_cents: number;
    line_total_cents: number;
  }[];
};

const COLUMNS =
  'id, event_slug, event_name, status, provider, subtotal_cents, fees_cents, total_cents, created_at, ' +
  'order_items(rate_id, rate_name, qty, unit_price_cents, fee_cents, line_subtotal_cents, line_total_cents)';

const toOrder = (r: OrderRow): Order => ({
  id: r.id,
  eventSlug: r.event_slug,
  eventName: r.event_name,
  status: r.status,
  provider: r.provider,
  subtotalCents: r.subtotal_cents,
  feesCents: r.fees_cents,
  totalCents: r.total_cents,
  createdAt: r.created_at,
  items: [...r.order_items]
    .sort((a, b) => a.rate_name.localeCompare(b.rate_name, 'es'))
    .map((i) => ({
      rateId: i.rate_id,
      rateName: i.rate_name,
      qty: i.qty,
      unitPriceCents: i.unit_price_cents,
      feeCents: i.fee_cents,
      lineSubtotalCents: i.line_subtotal_cents,
      lineTotalCents: i.line_total_cents,
    })),
});

/**
 * Lecturas con el cliente DEL USUARIO (no el de servidor): la RLS de la base de datos es la que
 * garantiza que solo ve sus pedidos, aunque este código tuviera un fallo.
 */
export async function listMyOrders(supabase: UserClient): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(COLUMNS)
    .order('created_at', { ascending: false })
    .limit(50)
    .returns<OrderRow[]>();
  if (error) throw new Error(`No se pudieron leer los pedidos: ${error.message}`);
  return (data ?? []).map(toOrder);
}

export async function getMyOrder(supabase: UserClient, id: string): Promise<Order | null> {
  if (!isOrderId(id)) return null;
  const { data, error } = await supabase.from('orders').select(COLUMNS).eq('id', id).maybeSingle<OrderRow>();
  if (error) throw new Error(`No se pudo leer el pedido: ${error.message}`);
  return data ? toOrder(data) : null;
}
