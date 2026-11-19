-- Fase 12: grabaciones del Voice Lab
-- Crea un espacio PRIVADO de archivos ("voice-recordings") para los audios
-- que lxs alumnxs le mandan a la profe desde el Voice Lab.
--   · Lxs alumnxs (sin login) solo pueden SUBIR audios: no pueden ver,
--     listar ni borrar nada.
--   · La profe (logueada en el panel) puede escucharlos y borrarlos.
--   · Solo audio, hasta 3 MB por archivo (20 segundos pesan mucho menos).
-- Los audios de más de 90 días los borra el panel automáticamente.
-- Se puede correr más de una vez sin problema.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voice-recordings',
  'voice-recordings',
  false,
  3145728,
  array['audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/mpeg', 'audio/wav', 'audio/aac']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "voice recordings: alumnxs suben" on storage.objects;
create policy "voice recordings: alumnxs suben"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'voice-recordings');

drop policy if exists "voice recordings: profe escucha" on storage.objects;
create policy "voice recordings: profe escucha"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'voice-recordings');

drop policy if exists "voice recordings: profe borra" on storage.objects;
create policy "voice recordings: profe borra"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'voice-recordings');
