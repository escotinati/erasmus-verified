-- ============================================================================
-- Endurecimiento de seguridad (auditoría 2026-09-28)
-- Aplicado en producción vía MCP en tres migraciones:
--   security_profiles_lock_membership_tier
--   security_revoke_excess_privileges_and_harden_functions
--   security_cta_clicks_constraints_and_partner_links_policy
-- Este archivo las consolida SOLO para dejar rastro en el repo. Ya está aplicado;
-- no volver a ejecutarlo sobre la base de datos de producción.
-- ============================================================================

-- 1) profiles: RLS filtra filas, no columnas. Con UPDATE de tabla completa, un usuario
--    podía hacer profiles.update({membership_tier:'plus'}). Solo se permiten columnas editables.
revoke all on public.profiles from anon;
revoke update on public.profiles from authenticated;
revoke truncate, references, trigger on public.profiles from authenticated;
grant update (city_id, university, interests, first_name, last_name)
  on public.profiles to authenticated;
revoke delete, insert on public.profiles from authenticated;

alter table public.profiles
  add constraint profiles_university_len_ck check (university is null or char_length(university) <= 120),
  add constraint profiles_first_name_len_ck check (first_name is null or char_length(first_name) <= 60),
  add constraint profiles_last_name_len_ck  check (last_name  is null or char_length(last_name)  <= 60),
  add constraint profiles_interests_size_ck check (cardinality(interests) <= 10);

-- 2) Funciones: handle_new_user es de trigger y no debe ser invocable por /rest/v1/rpc.
--    search_path vacío (ambas califican public.* / auth.* explícitamente).
revoke execute on function public.handle_new_user() from public, anon, authenticated;
alter function public.handle_new_user() set search_path = '';
alter function private.is_admin()       set search_path = '';

-- 3) Privilegios sobrantes. RLS ya bloqueaba el acceso; esto es defensa en profundidad.
revoke all on public.admins from anon, authenticated;
revoke truncate, references, trigger on
  public.cities, public.partners, public.partner_links,
  public.partner_events, public.cta_clicks
from anon, authenticated;
revoke insert, update, delete on public.cities, public.partners,
  public.partner_links, public.partner_events from anon;
revoke select, update, delete on public.cta_clicks from anon;

-- 4) cta_clicks: cualquiera puede insertar, así que se limita la FORMA de lo guardado.
alter table public.cta_clicks
  add constraint cta_clicks_link_type_ck check (link_type ~ '^[A-Za-z_]{1,40}$'),
  add constraint cta_clicks_domain_len_ck check (char_length(domain) between 1 and 253),
  add constraint cta_clicks_path_len_ck   check (char_length(path)   between 1 and 300);

-- 5) partner_links: la política pública era `using (true)` y exponía enlaces de partners
--    inactivos. Políticas separadas por rol: anon no tiene USAGE sobre el esquema private.
drop policy if exists "public read partner links" on public.partner_links;

create policy "anon read links of active partners"
  on public.partner_links for select to anon
  using (exists (select 1 from public.partners p where p.id = partner_id and p.active));

create policy "authenticated read links"
  on public.partner_links for select to authenticated
  using (
    private.is_admin()
    or exists (select 1 from public.partners p where p.id = partner_id and p.active)
  );
