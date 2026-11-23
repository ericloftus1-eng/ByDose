# ByDose preview activation

## What exists

A dedicated Supabase Free resource is connected to Preview only. Production is unchanged. No remote migrations, Auth configuration, emails, or uploaded records have been verified by the agent.

The UI requires `NEXT_PUBLIC_BYDOSE_BACKEND_READY=true` in addition to the provider URL/publishable key. Until setup below is completed, account/upload controls and the suggestion form remain unavailable. Do not enable this flag just to hide setup warnings.

## Owner steps in the new Supabase project

1. Open the connected preview resource in Vercel and use **Open in Supabase**.
2. In this new, empty project's **SQL Editor**, apply these files in order, once:
   - `migrations/202611180001_community.sql`
   - `migrations/202611220001_bydose_ideas.sql`
   Use **New Query**, paste the SQL, and **Run**. These are first-time bootstrap migrations; do not rerun or apply to a populated/unrelated database. If adopting `supabase db push` later, reconcile this manual bootstrap with migration history first.
3. In Auth **URL Configuration**, set the Site URL to the exact preview's `/community` URL and allow that exact URL for confirmation/reset redirects. Use the stable branch preview listed in the PR and avoid wildcard access to unrelated previews. Confirmation and reset must return to the same origin used to sign in. Keep email confirmation enabled, require passwords of at least 12 characters, and configure an appropriate email sender and abuse protections before invitations. These controls beyond URL Configuration may move in the provider dashboard; consult the provider's current settings.
4. Tell the agent the SQL and Auth configuration are complete—never send passwords, keys, or email tokens. The agent can then set the readiness variable for Preview only and rebuild the preview. Production must remain disconnected until explicitly reviewed for launch.
5. Sign up with your own inbox on `/community`, confirm the email, sign in, use **Edit profile**, and post an image. Open **Suggest an idea** to save feedback and reload to verify persistence. Images/profiles/artwork captions are public; suggestions are private to their author and the database operator. Do not upload private images or metadata.

## What the agent can verify after activation

Only authenticated flows with documented, safe preview test access can be browser-verified. Do not send passwords in chat. The existing two-account checklist in `SETUP.md` still applies: session recovery/reset, ownership denials, upload/storage cleanup and cross-user isolation. Embedded PostgreSQL tests are not a substitute for hosted verification.

## Suggestion inbox

The site operator can read `public.site_suggestions` in trusted provider tooling and update `status` there. Ordinary users cannot set their own status, read another user's ideas, or update/delete suggestions. No public board, voting, attachment upload, admin browser role, moderation system, or automatic implementation promise is included. Each account can submit five ideas per rolling 24 hours.

## References

- https://supabase.com/docs/guides/database/functions (SQL Editor / New Query / Run)
- https://supabase.com/docs/guides/auth/redirect-urls (URL Configuration)
- https://supabase.com/docs/guides/deployment/database-migrations (migration-history caveat)
