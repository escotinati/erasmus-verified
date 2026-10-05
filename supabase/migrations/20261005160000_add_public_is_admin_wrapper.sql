-- Wrapper en `public` de private.is_admin() para poder llamarlo con supabase.rpc('is_admin') desde el
-- servidor de la web (Next.js) con la sesión del usuario. Misma lógica que usan las políticas RLS:
-- no expone la tabla `admins` (sin grants para anon/authenticated) y solo devuelve un booleano.
-- Aplicada en el proyecto puivkbjgbfnlpepyednt el 05/10/2026 (migración `add_public_is_admin_wrapper`).
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.is_admin(); $$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
