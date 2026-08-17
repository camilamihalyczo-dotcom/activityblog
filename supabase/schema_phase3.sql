-- Activity Blog — fase 3 (imágenes). Corré esto una sola vez en tu proyecto
-- de Supabase: SQL Editor → New query → pegar todo este archivo → Run.
-- A diferencia de los scripts anteriores, este está armado para poder
-- correrse de nuevo sin errores si hace falta (usa "if not exists" y
-- bloques que primero chequean si la política ya existe).

-- 1) Columna para la imagen de portada de un post de blog.
alter table blog_posts add column if not exists image_url text;

-- 2) Bucket de Storage donde se guardan las imágenes (portadas de blog y
--    flashcards). "public = true" hace que las imágenes se puedan ver con
--    una URL directa, sin necesidad de login — igual que fotos en
--    cualquier sitio.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- 3) Permisos: cualquiera puede VER las imágenes (son públicas por
--    diseño), pero solo vos, logueada en /notas-profe, podés subir,
--    reemplazar o borrar.
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'public_read_media'
  ) then
    create policy "public_read_media"
      on storage.objects for select
      to anon, authenticated
      using (bucket_id = 'media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated_insert_media'
  ) then
    create policy "authenticated_insert_media"
      on storage.objects for insert
      to authenticated
      with check (bucket_id = 'media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated_update_media'
  ) then
    create policy "authenticated_update_media"
      on storage.objects for update
      to authenticated
      using (bucket_id = 'media');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated_delete_media'
  ) then
    create policy "authenticated_delete_media"
      on storage.objects for delete
      to authenticated
      using (bucket_id = 'media');
  end if;
end $$;
