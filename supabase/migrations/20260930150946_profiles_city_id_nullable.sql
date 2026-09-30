-- city_id pasa a opcional: web/ (Next.js) registra solo con email, contraseña y nombre.
-- La FK a cities(id) se mantiene: si hay valor, debe existir.
-- Aplicada vía MCP el 2026-09-30 (versión 20260930150946); este archivo la deja en el repo.
alter table public.profiles alter column city_id drop not null;
