-- Apply once to a NEW, preview-only Supabase project. No sample users or posts.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,40}$'),
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  bio text not null default '' check (char_length(bio) <= 1000),
  medium text not null default '' check (char_length(medium) <= 80),
  avatar_path text check (avatar_path ~ ('^' || id::text || '/[a-f0-9-]+\.(jpg|png|webp)$')),
  created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 100),
  caption text not null default '' check (char_length(caption) <= 2000),
  medium text not null check (medium in ('Painting', 'Digital', 'Photography', 'Sculpture', 'Mixed media', 'Other')),
  alt_text text not null check (char_length(btrim(alt_text)) between 1 and 500),
  image_path text not null unique check (image_path ~ ('^' || artist_id::text || '/[a-f0-9-]+\.(jpg|png|webp)$')),
  created_at timestamptz not null default now()
);
create index posts_created_at_idx on public.posts(created_at desc, id desc);
create index posts_artist_idx on public.posts(artist_id, created_at desc);

-- Do not copy email addresses or arbitrary metadata into public profiles.
create function public.create_artist_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, username, display_name)
  values (new.id, 'artist_' || replace(new.id::text, '-', ''), 'New artist');
  return new;
end;
$$;
revoke all on function public.create_artist_profile() from public, anon, authenticated;
create trigger create_artist_profile after insert on auth.users
for each row execute function public.create_artist_profile();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
revoke all on public.profiles, public.posts from anon, authenticated;
grant select on public.profiles, public.posts to anon, authenticated;
grant update (username, display_name, bio, medium, avatar_path) on public.profiles to authenticated;
grant insert (artist_id, title, caption, medium, alt_text, image_path) on public.posts to authenticated;
grant delete on public.posts to authenticated;

create policy profiles_read on public.profiles for select to anon, authenticated using (true);
create policy profiles_update_self on public.profiles for update to authenticated
using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy posts_read on public.posts for select to anon, authenticated using (true);
create policy posts_create_self on public.posts for insert to authenticated
with check ((select auth.uid()) = artist_id and exists (
  select 1 from storage.objects where bucket_id = 'dose-artwork' and name = image_path and owner_id = (select auth.uid())::text
));
create policy posts_delete_self on public.posts for delete to authenticated using ((select auth.uid()) = artist_id);

-- Published media is PUBLIC. Only upload work intended for public display.
-- Bucket MIME/size restrictions are server-side as well as in the UI.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
('dose-artwork', 'dose-artwork', true, 5242880, array['image/jpeg','image/png','image/webp']),
('dose-avatars', 'dose-avatars', true, 5242880, array['image/jpeg','image/png','image/webp']);

create policy dose_media_upload on storage.objects for insert to authenticated with check (
  bucket_id in ('dose-artwork','dose-avatars')
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and name ~ ('^' || (select auth.uid())::text || '/[a-f0-9-]+\.(jpg|png|webp)$')
  and owner_id = (select auth.uid())::text
);
create policy dose_media_read_self on storage.objects for select to authenticated using (
  bucket_id in ('dose-artwork','dose-avatars') and owner_id = (select auth.uid())::text
);
-- No overwrite policy. Immutable random paths avoid replacing another post's image.
create policy dose_media_delete_self on storage.objects for delete to authenticated using (
  bucket_id in ('dose-artwork','dose-avatars') and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and not exists (select 1 from public.posts where image_path = name and bucket_id = 'dose-artwork')
  and not exists (select 1 from public.profiles where avatar_path = name and bucket_id = 'dose-avatars')
);
commit;
