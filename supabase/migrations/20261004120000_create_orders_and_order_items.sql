-- =====================================================================
-- Pedidos de la web nueva (web/): orders + order_items + create_order()
-- Hoy el pago es simulado (provider = 'simulated'); luego Fourvenues.
--
-- Decisiones ya tomadas con el propietario del proyecto:
--  * Los pedidos NO se borran nunca (ON DELETE RESTRICT, sin permiso de DELETE).
--  * Se guarda copia del email y nombre del comprador (snapshot contable).
--  * El servidor escribe con la secret key (rol service_role, que salta RLS).
--  * Los usuarios solo LEEN sus pedidos (RLS + grants: dos barreras).
--  * Dinero en céntimos enteros, nunca decimales.
--  * Los totales del pedido los calcula LA BASE DE DATOS a partir de las líneas
--    (create_order), así cabecera y líneas no pueden quedar incoherentes.
--
-- No toca ninguna tabla existente: la web antigua no se ve afectada.
-- Estado NO aplicado: se aplica con apply_migration tras revisarla.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) orders: un pedido por compra
-- ---------------------------------------------------------------------
create table public.orders (
  id                uuid primary key default gen_random_uuid(),

  -- Dueño del pedido. RESTRICT: no se puede borrar un usuario que tenga
  -- pedidos (los pedidos son registro contable y no se borran).
  user_id           uuid not null references auth.users (id) on delete restrict,

  -- Copia del evento en el momento de la compra (todavía no hay tabla de eventos).
  event_slug        text not null,
  event_name        text not null,

  -- Copia del comprador en el momento de la compra: si luego cambia su perfil,
  -- el pedido conserva lo que se usó realmente.
  buyer_email       text not null,
  buyer_first_name  text null,

  -- Dinero SIEMPRE en céntimos enteros (1250 = 12,50 EUR).
  subtotal_cents    integer not null,
  fees_cents        integer not null,
  total_cents       integer not null,
  currency          text not null default 'EUR',

  status            text not null,
  provider          text not null,
  -- Id del pedido en el proveedor (Fourvenues). Null mientras sea simulado.
  provider_ref      text null,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint orders_amounts_nonneg_chk
    check (subtotal_cents >= 0 and fees_cents >= 0 and total_cents >= 0),
  constraint orders_total_sum_chk
    check (total_cents = subtotal_cents + fees_cents),
  constraint orders_currency_chk
    check (currency ~ '^[A-Z]{3}$'),
  constraint orders_status_chk
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  constraint orders_provider_chk
    check (provider in ('simulated', 'fourvenues')),
  constraint orders_event_slug_len_chk
    check (char_length(event_slug) between 1 and 100),
  constraint orders_event_name_len_chk
    check (char_length(event_name) between 1 and 200),
  constraint orders_buyer_email_len_chk
    check (char_length(buyer_email) between 3 and 254),
  constraint orders_buyer_first_name_len_chk
    check (buyer_first_name is null or char_length(buyer_first_name) <= 60),
  constraint orders_provider_ref_len_chk
    check (provider_ref is null or char_length(provider_ref) between 1 and 200)
);

comment on table public.orders is
  'Pedidos de entradas de la web nueva. Solo escribe el servidor (service_role); el usuario solo lee los suyos.';
comment on column public.orders.user_id is
  'auth.users.id del comprador. ON DELETE RESTRICT: los pedidos no se borran.';
comment on column public.orders.total_cents is
  'Total en céntimos enteros. Debe ser subtotal_cents + fees_cents (CHECK).';
comment on column public.orders.provider_ref is
  'Referencia del pedido en el proveedor (Fourvenues). NULL si es simulado.';

-- Mantiene updated_at con la función que ya usan cities/partners/profiles.
create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.touch_updated_at();

-- Unicidad parcial: dos pedidos no pueden compartir la misma referencia del
-- MISMO proveedor (protege contra webhooks duplicados). Los NULL no cuentan.
create unique index orders_provider_ref_uidx
  on public.orders (provider, provider_ref)
  where provider_ref is not null;

-- "Mis entradas": pedidos de un usuario, el más reciente primero.
-- Al empezar por user_id también cubre el índice de la FK.
create index orders_user_id_created_at_idx
  on public.orders (user_id, created_at desc);


-- ---------------------------------------------------------------------
-- 2) order_items: líneas de cada pedido (una por tarifa)
--    La comisión es POR ENTRADA (fee_cents). El subtotal de la línea se guarda
--    aparte porque, si una tarifa cambia de tramo de precio a mitad de compra,
--    no es simplemente cantidad x precio unitario (ver lib/pricing.ts).
-- ---------------------------------------------------------------------
create table public.order_items (
  id                  uuid primary key default gen_random_uuid(),

  -- RESTRICT: no se puede borrar un pedido que tenga líneas.
  order_id            uuid not null references public.orders (id) on delete restrict,

  rate_id             text not null,
  rate_name           text not null,
  qty                 integer not null,
  unit_price_cents    integer not null,   -- precio unitario del tramo actual (informativo)
  fee_cents           integer not null,   -- gastos de gestión POR ENTRADA
  line_subtotal_cents integer not null,   -- importe de las entradas de la línea, sin gastos
  line_total_cents    integer not null,   -- line_subtotal + qty * fee

  constraint order_items_qty_chk
    check (qty between 1 and 10),         -- MAX_PER_RATE = 10
  constraint order_items_amounts_nonneg_chk
    check (unit_price_cents >= 0 and fee_cents >= 0
           and line_subtotal_cents >= 0 and line_total_cents >= 0),
  constraint order_items_line_total_chk
    check (line_total_cents = line_subtotal_cents + qty * fee_cents),
  constraint order_items_rate_id_len_chk
    check (char_length(rate_id) between 1 and 100),
  constraint order_items_rate_name_len_chk
    check (char_length(rate_name) between 1 and 200),
  -- Una tarifa aparece una sola vez por pedido (la selección es un mapa tarifa -> cantidad).
  constraint order_items_order_rate_uniq
    unique (order_id, rate_id)
);

comment on table public.order_items is
  'Líneas de un pedido (una por tarifa). Solo escribe el servidor; el usuario lee las de sus pedidos.';

-- Índice de la FK: listar las líneas de un pedido y acelerar el EXISTS de la política RLS.
-- (unique (order_id, rate_id) ya lo cubre por el prefijo order_id, así que no hace falta otro.)


-- ---------------------------------------------------------------------
-- 3) RLS: activado en ambas
-- ---------------------------------------------------------------------
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Única política: el usuario autenticado lee SOLO sus pedidos.
-- (select auth.uid()) en vez de auth.uid() pelado: Postgres lo evalúa una
-- sola vez por consulta y no una vez por fila (más rápido).
create policy "users read own orders"
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Las líneas se leen solo si el pedido padre es del usuario.
create policy "users read own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

-- NO hay políticas de INSERT/UPDATE/DELETE: con RLS activado eso significa
-- "denegado" para anon y authenticated. Solo service_role (que salta RLS) escribe.


-- ---------------------------------------------------------------------
-- 4) Permisos (GRANT/REVOKE): segunda barrera, además de RLS
-- ---------------------------------------------------------------------
-- Supabase da por defecto TODOS los permisos de las tablas nuevas de public a
-- anon, authenticated y service_role (default privileges). Hay que quitarlos
-- explícitamente. Mismo patrón que profiles: anon nada, authenticated solo SELECT.
revoke all on public.orders      from anon, authenticated, service_role;
revoke all on public.order_items from anon, authenticated, service_role;

grant select on public.orders      to authenticated;
grant select on public.order_items to authenticated;

-- service_role (el servidor): lo mínimo necesario. Sin DELETE ni TRUNCATE,
-- porque los pedidos no se borran nunca. Más estricto que en profiles a propósito.
-- UPDATE solo sobre status y provider_ref (lo único que cambia tras crear el
-- pedido: pago confirmado / referencia de Fourvenues). Los importes y el
-- comprador quedan inmutables aunque el servidor tuviera un bug.
-- (updated_at lo pone el trigger, que no necesita este permiso.)
grant select, insert              on public.orders      to service_role;
grant update (status, provider_ref) on public.orders    to service_role;
grant select, insert              on public.order_items to service_role;


-- ---------------------------------------------------------------------
-- 5) create_order(): crea cabecera + líneas en UNA transacción
--    Los importes de la cabecera NO se reciben: se calculan aquí sumando las
--    líneas. Así es imposible que el pedido diga una cosa y sus líneas otra, y
--    nunca queda un pedido sin líneas (si algo falla, se deshace todo).
--    SECURITY INVOKER (por defecto): se ejecuta con los permisos de quien la
--    llama, y solo service_role puede ejecutarla.
-- ---------------------------------------------------------------------
create function public.create_order(
  p_user_id          uuid,
  p_event_slug       text,
  p_event_name       text,
  p_buyer_email      text,
  p_buyer_first_name text,
  p_status           text,
  p_provider         text,
  p_provider_ref     text,
  -- Array JSON de líneas: { rate_id, rate_name, qty, unit_price_cents, fee_cents, line_subtotal_cents }
  p_items            jsonb
) returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_subtotal integer;
  v_fees     integer;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'create_order: p_items debe ser un array no vacío' using errcode = '22023';
  end if;

  select coalesce(sum((i ->> 'line_subtotal_cents')::integer), 0),
         coalesce(sum((i ->> 'qty')::integer * (i ->> 'fee_cents')::integer), 0)
    into v_subtotal, v_fees
  from jsonb_array_elements(p_items) as i;

  insert into public.orders (
    user_id, event_slug, event_name, buyer_email, buyer_first_name,
    subtotal_cents, fees_cents, total_cents, status, provider, provider_ref
  ) values (
    p_user_id, p_event_slug, p_event_name, p_buyer_email, p_buyer_first_name,
    v_subtotal, v_fees, v_subtotal + v_fees, p_status, p_provider, p_provider_ref
  )
  returning id into v_order_id;

  insert into public.order_items (
    order_id, rate_id, rate_name, qty, unit_price_cents, fee_cents,
    line_subtotal_cents, line_total_cents
  )
  select v_order_id,
         i ->> 'rate_id',
         i ->> 'rate_name',
         (i ->> 'qty')::integer,
         (i ->> 'unit_price_cents')::integer,
         (i ->> 'fee_cents')::integer,
         (i ->> 'line_subtotal_cents')::integer,
         (i ->> 'line_subtotal_cents')::integer + (i ->> 'qty')::integer * (i ->> 'fee_cents')::integer
  from jsonb_array_elements(p_items) as i;

  return v_order_id;
end;
$$;

comment on function public.create_order(uuid, text, text, text, text, text, text, text, jsonb) is
  'Crea un pedido y sus líneas en una transacción; calcula los totales de la cabecera desde las líneas. Solo service_role.';

-- Por defecto Postgres da EXECUTE a todos (PUBLIC): hay que quitarlo.
revoke execute on function public.create_order(uuid, text, text, text, text, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_order(uuid, text, text, text, text, text, text, text, jsonb)
  to service_role;
