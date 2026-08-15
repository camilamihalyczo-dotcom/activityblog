-- Activity Blog — schema del blog (fase 1 del panel de administración).
-- Corré esto una sola vez en tu proyecto de Supabase: Dashboard → SQL Editor
-- → New query → pegar todo este archivo → Run.

create extension if not exists pgcrypto;

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  audience text not null check (audience in ('adultos', 'infancias')),
  slug text not null,
  date date not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  unique (audience, slug)
);

alter table blog_posts enable row level security;

-- El sitio público (alumnos, familias) puede LEER los posts sin login.
create policy "public_read_blog_posts"
  on blog_posts for select
  to anon, authenticated
  using (true);

-- Solo un usuario logueado (vos, en /admin) puede crear, editar o borrar.
create policy "authenticated_insert_blog_posts"
  on blog_posts for insert
  to authenticated
  with check (true);

create policy "authenticated_update_blog_posts"
  on blog_posts for update
  to authenticated
  using (true)
  with check (true);

create policy "authenticated_delete_blog_posts"
  on blog_posts for delete
  to authenticated
  using (true);
