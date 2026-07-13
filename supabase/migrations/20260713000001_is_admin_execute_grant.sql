-- Cierra el WARN de Supabase Advisors "authenticated_security_definer_function_executable":
-- is_admin() era SECURITY DEFINER en el esquema public, lo que PostgREST
-- exponía automáticamente como RPC invocable por cualquier usuario logueado
-- (/rest/v1/rpc/is_admin). El informe de seguridad pedía revocar EXECUTE a
-- "authenticated", pero eso habría roto el panel de admin: is_admin() se usa
-- directamente dentro de policies con roles={authenticated} en cities,
-- partners, partner_events, partner_links y cta_clicks, y Postgres exige
-- EXECUTE sobre cualquier función referenciada en USING/WITH CHECK al rol
-- que evalúa la policy (el SECURITY DEFINER solo cambia con qué privilegios
-- corre el cuerpo de la función una vez invocada, no si el llamante puede
-- invocarla).
--
-- Verificado (grep) que ningún JS del frontend llama a
-- supabase.rpc('is_admin') directamente; solo se usa dentro de RLS.
--
-- Fix aplicado: mover la función a un esquema "private" no expuesto por
-- PostgREST (solo expone "public" y "graphql_public" por defecto), y
-- conservar el grant EXECUTE a authenticated que las policies necesitan.
--
-- IMPORTANTE — detalle descubierto durante la verificación posterior: crear
-- un esquema nuevo NO concede USAGE a otros roles por defecto. Mover
-- solo la función (conservando su EXECUTE) no basta: sin GRANT USAGE ON
-- SCHEMA private, "authenticated" no puede ni siquiera resolver
-- private.is_admin() dentro de las policies (error "permission denied for
-- schema private"), lo que habría roto el panel de admin igualmente, solo
-- que por un mecanismo distinto al que se quiso evitar. Confirmado con una
-- simulación de sesión (SET LOCAL role/request.jwt.claims) antes y después
-- del GRANT USAGE: fallaba con permission denied antes, funcionaba después
-- (is_admin() = true, 7 partners visibles incl. inactivos para el admin
-- simulado, frente a 6 activos para "anon").

create schema if not exists private;
alter function public.is_admin() set schema private;
grant usage on schema private to authenticated, service_role;

-- El cuerpo de la función sigue referenciando public.admins (no cambia,
-- solo se movió la función en sí) y el search_path fijo a 'public' sigue
-- intacto tras el ALTER FUNCTION ... SET SCHEMA.
