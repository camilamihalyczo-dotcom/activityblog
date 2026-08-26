-- Activity Blog — fase 7 (respuestas de los alumnos). Corré esto una sola
-- vez en tu proyecto de Supabase: SQL Editor → New query → pegar todo
-- este archivo → Run.
--
-- Hasta ahora, cuando un alumno completaba un ejercicio (Completar
-- oraciones, Cuestionario, Sinónimos y antónimos, Listening) la corrección
-- se mostraba en pantalla pero no quedaba guardada en ningún lado — al
-- recargar la página, se perdía. Y Reading & Writing ni siquiera se
-- guardaba: era un textarea suelto. Esta tabla guarda cada entrega para
-- que puedas revisarla después en /notas-profe/respuestas: qué contestó,
-- qué estuvo bien/mal, y (si lo puso) de quién es.
--
-- Todavía no hay login de alumno, así que cualquiera puede insertar acá
-- (mismo patrón que un formulario de contacto público) — pero solo vos,
-- logueada, podés leerlo. El nombre es un campo de texto libre y opcional
-- que completa el alumno mismo, no un usuario real: para agrupar con
-- certeza todo lo que responde una misma persona haría falta login por
-- alumno más adelante — por ahora alcanza para ver qué se repite.

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('adultos', 'infancias')),
  level_slug text,
  track_slug text,
  temario_slug text,
  group_slug text,
  content_type text not null check (
    content_type in ('fill_blank', 'quiz', 'synonyms_antonyms', 'listening', 'reading_writing')
  ),
  -- Contexto extra para cuando un mismo temario/grupo tiene más de un ítem
  -- del mismo tipo (varios videos de Listening, varias consignas de
  -- Reading/Writing) — el título de ese ítem puntual.
  label text,
  student_name text,
  score int,
  total int,
  detail jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table submissions enable row level security;

-- Cualquiera puede insertar (lo hacen los alumnos, sin login) — igual
-- patrón que un formulario de contacto público.
create policy "public_insert_submissions"
  on submissions for insert
  to anon, authenticated
  with check (true);

-- Solo vos, logueada en /notas-profe, podés ver y borrar las respuestas.
create policy "authenticated_select_submissions"
  on submissions for select
  to authenticated
  using (true);

create policy "authenticated_delete_submissions"
  on submissions for delete
  to authenticated
  using (true);

create index if not exists submissions_created_at_idx on submissions (created_at desc);
