-- Apply AFTER 202611180001_community.sql to the dedicated preview project.
begin;
alter table public.posts drop constraint posts_medium_check;
alter table public.posts add constraint posts_medium_check check (
  medium in ('Graffiti','Murals','Blackbooks','Painting','Digital','Photography','Sculpture','Mixed media','Other')
);

-- Private feedback, not an unmoderated public message board.
create table public.site_suggestions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 120),
  details text not null check (char_length(btrim(details)) between 1 and 3000),
  category text not null check (category in ('Site design','Feature','New space','Something else')),
  status text not null default 'Suggested' check (status in ('Suggested','Exploring','Building','Shipped','Not planned')),
  created_at timestamptz not null default now()
);
create index site_suggestions_author_created_idx on public.site_suggestions(author_id, created_at desc, id desc);
alter table public.site_suggestions enable row level security;
revoke all on public.site_suggestions from anon, authenticated;
grant select on public.site_suggestions to authenticated;
grant insert (author_id, title, details, category) on public.site_suggestions to authenticated;
create policy site_suggestions_read_self on public.site_suggestions for select to authenticated
using ((select auth.uid()) = author_id);
create policy site_suggestions_insert_self on public.site_suggestions for insert to authenticated
with check ((select auth.uid()) = author_id);

-- Serialize inserts per author so simultaneous requests cannot exceed the daily limit.
create function public.limit_site_suggestions() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new.author_id::text, 0));
  if (select count(*) from public.site_suggestions where author_id = new.author_id and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'Daily suggestion limit reached';
  end if;
  return new;
end;
$$;
revoke all on function public.limit_site_suggestions() from public, anon, authenticated;
create trigger site_suggestions_rate_limit before insert on public.site_suggestions
for each row execute function public.limit_site_suggestions();
commit;
