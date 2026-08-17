-- Activity Blog — fase 6 (glosario). Corré esto una sola vez en tu
-- proyecto de Supabase: SQL Editor → New query → pegar todo este archivo
-- → Run. Se puede volver a correr sin problema si hace falta.
--
-- El glosario combina dos fuentes: las palabras que ya están en las
-- flashcards de cada track/grupo (se leen directo de `content_items`, no
-- hace falta duplicarlas acá) y palabras sueltas que cargues a mano en
-- esta tabla nueva — por ejemplo, vocabulario que salió en una clase pero
-- todavía no tiene su propia flashcard.

create table if not exists glossary_entries (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('adultos', 'infancias')),
  level_slug text,
  track_slug text,
  group_slug text,
  word text not null,
  translation text not null,
  example text,
  created_at timestamptz not null default now()
);

alter table glossary_entries enable row level security;

-- Igual patrón que el resto del contenido de estudio: lectura pública
-- (lo ven los alumnos en /adultos y /infancias), escritura solo logueada.
create policy "public_read_glossary_entries"
  on glossary_entries for select
  to anon, authenticated
  using (true);

create policy "authenticated_insert_glossary_entries"
  on glossary_entries for insert
  to authenticated
  with check (true);

create policy "authenticated_update_glossary_entries"
  on glossary_entries for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_delete_glossary_entries"
  on glossary_entries for delete
  to authenticated
  using (true);
