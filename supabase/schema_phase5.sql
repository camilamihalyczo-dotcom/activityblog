-- Activity Blog — fase 5 (registro de errores recurrentes). Corré esto una
-- sola vez en tu proyecto de Supabase: SQL Editor → New query → pegar todo
-- este archivo → Run. Se puede volver a correr sin problema si hace falta.
--
-- A diferencia del resto de las tablas (blog, tracks, contenido), esta es
-- información privada sobre tus alumnos: por eso NO tiene política de
-- lectura pública. Solo vos, logueado en /notas-profe, podés leer y
-- escribir estos datos.

create table if not exists error_notes (
  id uuid primary key default gen_random_uuid(),
  student text not null,
  category text not null,
  note_date date not null default current_date,
  example text,
  correction text,
  notes text,
  created_at timestamptz not null default now()
);

alter table error_notes enable row level security;

create policy "authenticated_select_error_notes"
  on error_notes for select
  to authenticated
  using (true);

create policy "authenticated_insert_error_notes"
  on error_notes for insert
  to authenticated
  with check (true);

create policy "authenticated_update_error_notes"
  on error_notes for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_delete_error_notes"
  on error_notes for delete
  to authenticated
  using (true);
