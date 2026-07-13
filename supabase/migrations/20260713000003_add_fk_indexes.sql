-- Cierra el WARN de Supabase Advisors "unindexed_foreign_keys" en las
-- 3 columnas que carecían de índice propio:
--   cta_clicks.partner_id     -> partners(id)
--   partner_events.partner_id -> partners(id)
--   partner_links.partner_id  -> partners(id)
--
-- No hacían falta índices nuevos para:
--   partners.city_id -> cities(id)  ya cubierta por partners_city_id_idx
--                        (btree sobre (city_id, active, priority desc);
--                        city_id es la columna líder, sirve igual para
--                        joins/deletes por city_id)
--   admins.user_id    -> auth.users(id)  ya es la propia PK de admins
--
-- Consultas que se benefician: reporte de clics del panel de admin
-- (cta_clicks agrupado por partner_id), fetchPartnersByCity trayendo
-- partner_links por partner_id, listado de eventos por partner en
-- mapPartners.js/admin.js, y el ON DELETE CASCADE de las 3 tablas al
-- borrar un partner (antes obligaba a seq scan de la tabla hija).
--
-- Tablas pequeñas en fase de desarrollo: CREATE INDEX normal (bloqueante,
-- breve) es suficiente, no hace falta CONCURRENTLY.
create index if not exists cta_clicks_partner_id_idx
    on public.cta_clicks (partner_id);

create index if not exists partner_events_partner_id_idx
    on public.partner_events (partner_id);

create index if not exists partner_links_partner_id_idx
    on public.partner_links (partner_id);

-- Verificado con get_advisors(performance): unindexed_foreign_keys ya no
-- aparece para estas 3 columnas. Aparece en su lugar un lint INFO nuevo
-- "unused_index" para los 3 índices recién creados — esperado y benigno,
-- Postgres no tiene estadísticas de uso hasta que el índice recibe
-- tráfico real; se autorresuelve, no es una regresión.
