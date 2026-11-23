-- Run once on the existing ByDose database. Preserves all existing posts.
begin;
alter table public.posts add column show_in_feed boolean not null default true;
grant insert (show_in_feed) on public.posts to authenticated;
create index posts_main_feed_created_idx on public.posts(created_at desc, id desc) where show_in_feed = true;
-- Profile-only posts remain PUBLIC under the existing read policy.
-- This is feed placement, not privacy. Existing update/delete ownership is unchanged.
commit;
