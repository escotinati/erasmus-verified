-- Migra a JSONB las columnas de texto libre que necesitan soporte
-- multiidioma (ES + EN, MVP). Los datos existentes están en español y
-- se preservan envolviéndolos en {"es": valor_actual} — nada se pierde.
--
-- NO se tocan en esta migración (se traducen en la capa de UI en una
-- fase posterior, no en el dato): partners.name, partners.category,
-- partner_events.theme, cities.name, cities.country, ni ninguna URL,
-- booleano, número o timestamp.
--
-- Patrón por columna: columna auxiliar <col>_new (jsonb) → poblar desde
-- la columna vieja → drop de la vieja → rename de _new al nombre
-- original → CHECK que garantiza que la clave 'es' siempre está
-- presente (es el fallback mínimo del que depende tField() en
-- src/utils/i18n.js).

-- ── partners.description ──────────────────────────────────────────
alter table public.partners add column description_new jsonb;

update public.partners set description_new = jsonb_build_object('es', description)
    where description is not null;
update public.partners set description_new = jsonb_build_object('es', '')
    where description is null;

alter table public.partners drop column description;
alter table public.partners rename column description_new to description;

alter table public.partners add constraint partners_description_has_es
    check (description ? 'es');

-- ── partner_events.title ───────────────────────────────────────────
alter table public.partner_events add column title_new jsonb;

update public.partner_events set title_new = jsonb_build_object('es', title)
    where title is not null;
update public.partner_events set title_new = jsonb_build_object('es', '')
    where title is null;

alter table public.partner_events drop column title;
alter table public.partner_events rename column title_new to title;

alter table public.partner_events add constraint partner_events_title_has_es
    check (title ? 'es');

-- ── partner_events.description ─────────────────────────────────────
alter table public.partner_events add column description_new jsonb;

update public.partner_events set description_new = jsonb_build_object('es', description)
    where description is not null;
update public.partner_events set description_new = jsonb_build_object('es', '')
    where description is null;

alter table public.partner_events drop column description;
alter table public.partner_events rename column description_new to description;

alter table public.partner_events add constraint partner_events_description_has_es
    check (description ? 'es');

-- ── partner_events.price_label ─────────────────────────────────────
alter table public.partner_events add column price_label_new jsonb;

update public.partner_events set price_label_new = jsonb_build_object('es', price_label)
    where price_label is not null;
update public.partner_events set price_label_new = jsonb_build_object('es', '')
    where price_label is null;

alter table public.partner_events drop column price_label;
alter table public.partner_events rename column price_label_new to price_label;

alter table public.partner_events add constraint partner_events_price_label_has_es
    check (price_label ? 'es');

-- ── cities.description ─────────────────────────────────────────────
alter table public.cities add column description_new jsonb;

update public.cities set description_new = jsonb_build_object('es', description)
    where description is not null;
update public.cities set description_new = jsonb_build_object('es', '')
    where description is null;

alter table public.cities drop column description;
alter table public.cities rename column description_new to description;

alter table public.cities add constraint cities_description_has_es
    check (description ? 'es');

-- ── partner_links.label ────────────────────────────────────────────
alter table public.partner_links add column label_new jsonb;

update public.partner_links set label_new = jsonb_build_object('es', label)
    where label is not null;
update public.partner_links set label_new = jsonb_build_object('es', '')
    where label is null;

alter table public.partner_links drop column label;
alter table public.partner_links rename column label_new to label;

alter table public.partner_links add constraint partner_links_label_has_es
    check (label ? 'es');
