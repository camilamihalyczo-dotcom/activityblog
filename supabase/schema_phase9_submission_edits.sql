-- Activity Blog — fase 9 (editar una entrega recién guardada).
-- Corré esto una sola vez en Supabase: SQL Editor → New query → pegar todo
-- este archivo → Run. Se puede volver a correr sin problema.
--
-- En Reading & Writing el alumno puede tocar "Seguir editando" después de
-- guardar. Antes, al volver a guardar se creaba una entrega nueva (quedaban
-- duplicadas en /notas-profe/respuestas). Ahora la página reusa el mismo id
-- y llama a esta función para actualizar la entrega existente.
--
-- Por qué una función y no una policy de UPDATE: los alumnos (sin login)
-- no pueden leer la tabla `submissions`, y Postgres exige permiso de
-- lectura para hacer UPDATE/upsert con filtro. Darles lectura expondría
-- las respuestas de todos. Esta función corre con permisos propios, pero
-- solo puede tocar UNA entrega: la del id exacto (un UUID aleatorio que
-- solo conoce el navegador que la creó) y solo si se creó hace menos de
-- una hora. Devuelve true si actualizó algo.

create or replace function public.update_recent_submission(
  p_id uuid,
  p_student_name text,
  p_score int,
  p_total int,
  p_detail jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update submissions
     set student_name = p_student_name,
         score = p_score,
         total = p_total,
         detail = coalesce(p_detail, '[]'::jsonb)
   where id = p_id
     and created_at > now() - interval '1 hour';
  return found;
end;
$$;

revoke all on function public.update_recent_submission(uuid, text, int, int, jsonb) from public;
grant execute on function public.update_recent_submission(uuid, text, int, int, jsonb) to anon, authenticated;
