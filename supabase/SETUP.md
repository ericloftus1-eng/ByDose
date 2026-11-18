# Community backend setup — Preview only

## Current status

The `/community` implementation is ready for integration, **not a live or verified social service**. At implementation time, no Supabase resource or environment variables were connected: Marketplace requires the team owner to accept Supabase's terms. No migration has been applied to a remote database.

Until connected, the route explicitly disables sign-in and uploads and explains setup is pending. `/` remains the separate fictional design demo. It does not silently substitute demo accounts for real ones.

## Provisioning

1. Complete the Supabase Marketplace consent flow supplied by the Vercel CLI. Do not send credentials in chat.
2. From a checkout linked to **bydose**, provision a new dedicated preview project:

   ```sh
   vercel install supabase --name bydose-community-preview --billing-plan free --meta region=iad1 -e preview --no-env-pull --scope tc-o-lds-rrn-100
   ```

   Confirm the connection covers **Preview only**, not Production. This adds public Supabase URL and publishable-key variables automatically. The client uses only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never expose a secret/service-role key. Do not connect a production or unrelated database.

3. Apply `migrations/202611180001_community.sql` once to the **new preview Supabase database** using the provider's trusted SQL runner or migration CLI. Do not run it against an existing populated database. The migration creates profiles, posts, an Auth trigger, RLS policies, and two public media buckets atomically.
4. Configure Supabase Auth email confirmation and password-reset redirects to the exact new preview URL ending in `/community`. Keep confirmation enabled, set the minimum password length to at least 12, configure rate limits and bot protection, and use an appropriate email sender before inviting testers. Avoid broad wildcard redirects. Do not disable confirmations to bypass testing.
5. Redeploy the preview from this PR after the variables and migration are ready. The immutable earlier preview will continue to show setup pending.

This repository does not need a service-role key or application database password at runtime. Supabase validates Auth tokens and enforces RLS for every database/storage operation, including direct API calls. Client session state controls only presentation. Sessions are browser-persisted by the Supabase client; this is not SSR cookie auth.

## Data and privacy

- Profiles and posts are publicly readable. Email/password information remains in Supabase Auth, not public profiles.
- Avatar and artwork buckets are public, including by direct media URL. Do not upload private or sensitive work. Remove metadata/location details before uploading. Images are not re-encoded to strip metadata in this foundation.
- Uploads use immutable random paths under the authenticated user's UUID. Only JPEG, PNG, or WebP up to 5 MB is allowed by the bucket; the UI also checks decoding and a 40-megapixel limit. SVG/HTML/GIF are rejected.
- Profile edits and post creation/deletion are authorized by the authenticated UUID. Posts require an already uploaded image owned by that user. Another user cannot edit/delete a profile, publish as another artist, or delete another artist's media.
- Deleting a post removes the row first and then its image. Replacing an avatar cleans up the old image afterward. Network interruptions can leave orphaned public media. Errors distinguish incomplete cleanup; inspect and remove orphaned objects using trusted owner tooling. Public caches can retain deleted images temporarily.
- No account-deletion UI, moderation, reporting, blocking, likes, comments, or follows are included on `/community` yet. Keep the preview invite-only; do not launch public sign-ups until safeguards, privacy/terms, and abuse controls are ready.
- Feed pagination is 12 posts at a time. Concurrent inserts/deletes can move offset pages; refresh for the newest ordering.

## Verification

```sh
npm ci
npm run test:foundation
npm run build
npm audit
```

The access-control test executes the actual migration in embedded PostgreSQL (PGlite), using minimal mocked `auth` and `storage` provider schemas. It verifies positive owner writes, public reads, cross-user and anonymous denials, invalid paths, ownership spoofing, missing uploads, immutable post fields, and linked-media deletion guards. Upload unit checks cover accepted MIME types and size boundaries. **These do not prove hosted Auth/Storage integration works.**

Before calling the backend complete, use two ordinary, separately authenticated preview accounts:

1. Sign up A with a controlled inbox, verify email, sign in, reload, sign out, sign back in, and test password reset. Never put passwords or tokens in a PR or chat.
2. Edit A's public name, unique username, medium, bio, and avatar. Reload and verify persistence. Confirm an invalid/duplicate username fails clearly.
3. Publish an image with title, caption, medium, alt text, and rights confirmation. Reload, browse signed out, and open the artist's gallery. Confirm email is not exposed.
4. With B's ordinary token, attempt direct API updates/deletes of A's profile/post and upload/delete of A's path. Expect denial or zero affected rows. Do not use a service role for these tests.
5. Check anonymous writes, oversized media, SVG/HTML disguised as image filenames, and expired sessions are rejected. Verify failed post inserts clean up the new upload.
6. Delete A's post and verify both gallery removal and storage cleanup, including signed-out behavior. Test desktop and mobile loading/error/empty states and pagination.

No test-user credentials, production accounts, email delivery, hosted policies, or real uploads have been verified in the setup-pending preview.

## References

- https://supabase.com/docs/guides/auth/passwords
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/storage/quickstart
