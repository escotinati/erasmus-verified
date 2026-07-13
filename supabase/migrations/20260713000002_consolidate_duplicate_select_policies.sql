-- Cierra el WARN de Supabase Advisors "multiple_permissive_policies" en
-- cities, partners y partner_events (rol authenticated, acción SELECT):
-- cada una tenía dos policies permisivas para ese rol+acción, obligando
-- a Postgres a evaluarlas ambas en cada SELECT.
--
-- cta_clicks NO tenía este problema (solo una policy de SELECT y otra de
-- INSERT, sin solape) pese a que el informe original la mencionaba junto
-- a partners; no se toca aquí.
--
-- cities: "public read all cities" ya usa using(true) a propósito (ver
-- 20260710000001_public_read_all_cities.sql — el directorio completo de
-- ciudades debe verse por cualquier visitante, activa o no). Ese true ya
-- es superconjunto de lo que aportaba "admin read all cities", así que
-- se elimina sin cambiar ningún comportamiento.
drop policy if exists "admin read all cities" on public.cities;

-- partners y partner_events: la policy de admin sí aportaba visibilidad
-- extra (inactivos / eventos pasados) que la pública no cubre, así que
-- no se puede borrar sin más. Se parte la policy pública en un scope
-- "anon" (visitantes no logueados) y se fusiona el OR is_admin() dentro
-- de la policy ya existente para "authenticated", dejando una única
-- policy permisiva por rol y preservando el acceso efectivo actual.
alter policy "public read active partners" on public.partners
    to anon
    using (active = true);

alter policy "admin read all partners" on public.partners
    using (active = true or private.is_admin());

alter policy "public read upcoming events" on public.partner_events
    to anon
    using (active = true and starts_at >= now() - interval '1 day');

alter policy "admin read all events" on public.partner_events
    using (
        (active = true and starts_at >= now() - interval '1 day')
        or private.is_admin()
    );

-- Verificado con simulación de sesión (SET LOCAL role / request.jwt.claims)
-- tras aplicar: authenticated resuelve private.is_admin() sin error dentro
-- de las policies fusionadas (el GRANT USAGE ON SCHEMA private del paso
-- anterior sigue cubriendo este caso). Recuento de filas visibles
-- coincide exactamente con el ground truth (sin RLS):
--   partners:       total=7, active=6  -> admin ve 7, anon ve 6
--   partner_events: total=6, upcoming=3 -> admin ve 6, anon ve 3
-- EXPLAIN ANALYZE en las 4 combinaciones (anon/admin x partners/
-- partner_events) muestra un único "Filter:" por query, sin evaluación
-- duplicada de policies. get_advisors(performance) confirma que
-- multiple_permissive_policies ya no aparece para cities/partners/
-- partner_events.
