-- El directorio completo de ciudades (ciudades.html / ciudades-todas.html)
-- debe mostrar TODAS las ciudades a cualquier visitante, tengan o no
-- grupo activo todavía — no solo las active=true. La política anterior
-- ("public read active cities") limitaba el SELECT público a activas,
-- lo cual bloqueaba el directorio completo para usuarios anónimos.
--
-- Descubierto durante la verificación manual de esta migración: con
-- fetchAllCities() pero la política antigua, un visitante anónimo solo
-- veía las 2 ciudades ya activas (Bilbao, Berlín), no las 491. El home
-- (fetchActiveCities, con su propio .eq('active', true) en la query) no
-- se ve afectado por este cambio: sigue mostrando solo las activas.
drop policy if exists "public read active cities" on public.cities;

create policy "public read all cities" on public.cities
    for select
    to public
    using (true);
