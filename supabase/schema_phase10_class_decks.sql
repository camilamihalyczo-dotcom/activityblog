-- Activity Blog — fase 10 (creador de presentaciones de clase y glosarios).
-- Corré esto una sola vez en Supabase: SQL Editor → New query → pegar todo
-- este archivo → Run. Se puede volver a correr sin problema.
--
-- Cada fila es una presentación de clase o un glosario armado desde
-- /notas-profe/clases. El contenido (slides y bloques) va en `data` como
-- JSON. Solo vos (logueada) podés listar, crear, editar y borrar.
--
-- Los alumnos ven cada clase por un link privado /clase/<share_token>: el
-- token es largo y aleatorio (imposible de adivinar) y la única forma de
-- leer una clase sin login es la función get_class_deck(token), que
-- devuelve SOLO esa clase. Así nadie puede listar las clases de otros.

create table if not exists class_decks (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'class' check (kind in ('class', 'glossary')),
  scope text not null check (scope in ('adultos', 'infancias')),
  template text not null,
  color_key text not null,
  title text not null default '',
  student text,
  share_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table class_decks enable row level security;

drop policy if exists "authenticated_all_class_decks" on class_decks;
create policy "authenticated_all_class_decks"
  on class_decks for all
  to authenticated
  using (true)
  with check (true);

create index if not exists class_decks_updated_at_idx on class_decks (updated_at desc);

create or replace function public.get_class_deck(p_token text)
returns table (
  kind text,
  scope text,
  template text,
  color_key text,
  title text,
  student text,
  data jsonb,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select kind, scope, template, color_key, title, student, data, updated_at
    from class_decks
   where share_token = p_token
   limit 1;
$$;

revoke all on function public.get_class_deck(text) from public;
grant execute on function public.get_class_deck(text) to anon, authenticated;
