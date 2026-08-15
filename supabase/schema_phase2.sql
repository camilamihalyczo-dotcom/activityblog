-- Activity Blog — schema fase 2 (tracks/temarios, grupos, contenido).
-- Corré esto en el SQL Editor de Supabase, DESPUÉS de schema.sql (fase 1,
-- el del blog). Después corré seed_phase2.sql para no perder lo que ya
-- había armado en el código.

create extension if not exists pgcrypto;

-- ─── Adultos: tracks y temarios ─────────────────────────────────────────

create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  progression text not null,
  -- Limitado a los colores que ya tienen clases de Tailwind armadas en el
  -- código (colorMaps.js) — Tailwind necesita ver la clase completa como
  -- texto literal en algún archivo fuente, así que no puede haber colores
  -- arbitrarios acá, solo estos.
  color_key text not null check (color_key in ('brand', 'stamp', 'olive', 'pink', 'violet', 'gold')),
  passcode text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists temarios (
  id uuid primary key default gen_random_uuid(),
  track_slug text not null references tracks (slug) on delete cascade,
  slug text not null,
  name text not null,
  description text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (track_slug, slug)
);

-- ─── Infancias: grupos ──────────────────────────────────────────────────

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  age_range text not null,
  description text not null,
  color_key text not null check (color_key in ('kidsYellow', 'kidsGreen', 'kidsBlue', 'kidsPurple')),
  milestone int not null,
  passcode text not null,
  -- Temas habilitados para este grupo, ej: {flashcards,listening}
  topics text[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ─── Contenido de estudio (flashcards, quiz, listening, reading&writing) ─
--
-- Un JSON por combinación de "dónde vive" + "qué tipo de contenido es",
-- en vez de una tabla relacional separada por tipo — el JSON tiene
-- exactamente la misma forma que ya usaban los archivos estáticos
-- (content/*.js), así que migrar y leer es directo.
--
-- `scope_key` es un identificador armado en el código (ej.
-- "adultos:b1-b2:business-english:foundations:flashcards" o
-- "infancias:primeros-pasos:flashcards") — evita el problema de que un
-- UNIQUE sobre columnas nullable no funciona como uno esperaría en
-- Postgres (NULL nunca es igual a NULL).

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  scope_key text unique not null,
  scope text not null check (scope in ('adultos', 'infancias')),
  level_slug text,
  track_slug text,
  temario_slug text,
  group_slug text,
  content_type text not null check (content_type in ('flashcards', 'quiz', 'listening', 'reading_writing')),
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ─── RLS: lectura pública, escritura solo logueada (vos, en /notas-profe) ─

alter table tracks enable row level security;
alter table temarios enable row level security;
alter table groups enable row level security;
alter table content_items enable row level security;

create policy "public_read_tracks" on tracks for select to anon, authenticated using (true);
create policy "authenticated_write_tracks" on tracks for insert to authenticated with check (true);
create policy "authenticated_update_tracks" on tracks for update to authenticated using (true) with check (true);
create policy "authenticated_delete_tracks" on tracks for delete to authenticated using (true);

create policy "public_read_temarios" on temarios for select to anon, authenticated using (true);
create policy "authenticated_write_temarios" on temarios for insert to authenticated with check (true);
create policy "authenticated_update_temarios" on temarios for update to authenticated using (true) with check (true);
create policy "authenticated_delete_temarios" on temarios for delete to authenticated using (true);

create policy "public_read_groups" on groups for select to anon, authenticated using (true);
create policy "authenticated_write_groups" on groups for insert to authenticated with check (true);
create policy "authenticated_update_groups" on groups for update to authenticated using (true) with check (true);
create policy "authenticated_delete_groups" on groups for delete to authenticated using (true);

create policy "public_read_content_items" on content_items for select to anon, authenticated using (true);
create policy "authenticated_write_content_items" on content_items for insert to authenticated with check (true);
create policy "authenticated_update_content_items" on content_items for update to authenticated using (true) with check (true);
create policy "authenticated_delete_content_items" on content_items for delete to authenticated using (true);
