-- Activity Blog — fase 11 (sugerencias guardadas en Supabase).
-- Corré esto una sola vez en Supabase: SQL Editor → New query → pegar todo
-- este archivo → Run. Se puede volver a correr sin problema (el aviso de
-- "operaciones destructivas" sale por el "drop policy if exists": solo
-- reemplaza las reglas de permisos de esta tabla, no borra datos).
--
-- Antes, el formulario de "Sugerencias" del pie solo mandaba un mail por
-- EmailJS (y si no estaba configurado, no aparecía). Ahora cada sugerencia
-- queda guardada acá y la ves en /notas-profe/sugerencias. Si EmailJS está
-- configurado, además te sigue llegando el mail.
--
-- Cualquiera puede ENVIAR (los alumnos no tienen login), con límites de
-- largo para evitar abusos; solo vos, logueada, podés leer, marcar y borrar.

create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'idea' check (category in ('idea', 'bug', 'content')),
  message text not null check (char_length(message) between 1 and 2000),
  name text check (name is null or char_length(name) <= 120),
  contact text check (contact is null or char_length(contact) <= 160),
  page text check (page is null or char_length(page) <= 300),
  scope text check (scope is null or scope in ('adultos', 'infancias', 'general')),
  status text not null default 'new' check (status in ('new', 'read', 'done')),
  created_at timestamptz not null default now()
);

alter table suggestions enable row level security;

drop policy if exists "public_insert_suggestions" on suggestions;
drop policy if exists "authenticated_select_suggestions" on suggestions;
drop policy if exists "authenticated_update_suggestions" on suggestions;
drop policy if exists "authenticated_delete_suggestions" on suggestions;

-- Los alumnos solo pueden crear sugerencias nuevas (siempre como "new").
create policy "public_insert_suggestions"
  on suggestions for insert
  to anon, authenticated
  with check (status = 'new');

create policy "authenticated_select_suggestions"
  on suggestions for select
  to authenticated
  using (true);

create policy "authenticated_update_suggestions"
  on suggestions for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_delete_suggestions"
  on suggestions for delete
  to authenticated
  using (true);

create index if not exists suggestions_created_at_idx on suggestions (created_at desc);
