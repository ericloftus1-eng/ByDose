# ByDose

Street roots. Open possibilities. DOSE Art is the first space inside ByDose, not the whole of it.

## Run and check

Node.js 20.9+; `npm ci`, `npm run dev`, `npm run test:foundation`, `npm run build`, `npm audit`, and `git diff --check`.

## Routes

- `/` and `/intro`: preserved animated DOSE mandala; **Enter ByDose** opens the umbrella landing page.
- `/hub`: direct ByDose landing page, DOSE Art entrance, deliberately disabled coming-soon spaces, and **Help shape ByDose**.
- `/community`: real account/profile/artwork integration foundation. Preview backend setup is still required, and controls stay unavailable until activated.
- `/suggestions`: DOSE Art-only private suggestions and own submission history.
- `/bydose-suggestions`: separate ByDose-branded inbox for the wider site and future spaces. Uses the same account, but a distinct private table and its own five-per-day limit.
- `/art-preview`: street-first interactive design demo with fictional artists, six original SVG studies, graffiti/mural/blackbook filters, and memory-only likes/saves/follows/comments/composer. No real uploads; state resets on reload. Photography uses an illustrated placeholder, not a photograph.
- `/collection`: preserved Secret Nine project concept; artist entries are not open.

## Backend status

A dedicated Supabase Free resource is connected to **Preview only**. No hosted SQL migrations, Auth redirect settings, real accounts, emails, or uploads have been verified. Follow [`supabase/ACTIVATE.md`](supabase/ACTIVATE.md) and the two-account checks in [`supabase/SETUP.md`](supabase/SETUP.md).

The application uses only public Supabase URL/publishable-key variables. `NEXT_PUBLIC_BYDOSE_BACKEND_READY=true` is a deployment readiness gate, not authorization. Supabase RLS and storage policies enforce ownership; never put a service-role key in client code. Keep the preview invitation-only until privacy, moderation, abuse, and deletion safeguards are ready.

`test:foundation` executes both actual migrations against embedded PostgreSQL with modeled Auth/Storage schemas and tests upload type/size validation. It covers private suggestions, ownership/spoofing denials and a five-per-day DB-enforced limit. It does not verify the hosted provider.

Artwork/profiles and their media URLs are public; suggestions are private to their author and the site operator. The operator reviews suggestions in provider tooling, not an unsecured browser admin panel.

## Assets

The six SVG artwork studies are original illustrations, not user submissions. Barlow Condensed 900 Latin is self-hosted under the SIL Open Font License (`public/fonts/OFL.txt`). No external runtime font service is used.

## Separate ByDose inbox activation

Apply **only** `supabase/migrations/202611220002_bydose_suggestions.sql` once to the existing preview database. It creates `bydose_suggestions` with self-only RLS and its own rate limit; it does not alter/delete old DOSE Art ideas, profiles or posts. Do not rerun the old bootstrap. Before this new table exists, the ByDose route shows an explicit setup-needed message and does not claim to save anything. If a network problem prevents checking the table, it also offers a retry.

The owner previously reported signup, profile changes, artwork and DOSE Art suggestions working and persisting after refresh on the preview. The readiness flag is already enabled for the hub preview branch. Hosted two-account isolation and password recovery remain unverified. The new ByDose inbox needs its new migration and a real submission test.

## DOSE Art main-feed placement

Apply only `supabase/migrations/202611220003_art_feed_choice.sql` once to the existing database. It adds a boolean with a default of true, preserving existing posts in the main feed. The posting form offers **Show on DOSE Art’s main feed**, checked by default. Unchecked posts remain publicly visible on artist profiles and by image URL, but not in Discover. Both initial feed queries and pagination filter before applying the page range. This is not a privacy control. No existing post-editing feature is added.

Until the new column is available, the checkbox is disabled with an explanation and posting retains its prior behavior. No old migration should be rerun. Hosted authenticated submission and pagination still require an ordinary account check after the migration.

## DOSE Art visitor appearance

Open **Your look** above the community or DOSE Art suggestion page. Choose Asphalt, Paper or After Hours independently of the Bold, Clean or Typewriter font. **Reset look** restores Asphalt/Bold. Choices are browser-local (`dose-art-appearance-v1`), work signed out, survive reload/navigation, and sync across tabs when browser storage permits. Blocked storage still permits a temporary in-memory choice and displays an honest save notice. Invalid stored values fall back to known presets.

Only `/community` (including its profile, posting and account views) and `/suggestions` opt in. ByDose hub/feedback, mandala, collection concept, and fictional design demo retain their separate styling. Artwork images are not tinted or filtered. This is visitor appearance, not artist-controlled profiles, music or shared account settings. No database migration or environment change is needed.

Run `node tests/appearance.mjs` for all nine preset combinations, storage/reset/invalid-data cases and contrast checks against the exact preset colors (4.5:1 normal text, 3:1 control boundaries). Visual and keyboard checks on a deployed preview still matter; these tests do not cover authenticated forms.

## Connected street-art layout

`/community` now uses the street-first three-column feed, with a responsive bottom navigation, real artist cards, preserved Auth/profile/upload forms and browser-local themes. `/art-preview` redirects to `/community`; the hub has one DOSE Art entrance. Fictional artists/posts and memory-only likes/follows/comments are removed from the normal path, not copied to the database. Real posts and profiles are unchanged.

Medium filters and explicit title search execute server-side on initial and paginated queries. Search escapes SQL LIKE wildcard characters as literals. Artist galleries retain profile-only posts; main feed respects the existing placement field. No SQL migration is needed. Run `node tests/feed-query.mjs` along with the existing checks.

General signup email remains blocked by provider configuration, not solved by the layout: the owner must configure a verified sender/custom SMTP in Supabase. No confirmations have been disabled and no provider credentials are requested in chat. Before distributing public QR stickers, test signup/confirmation/reset with an ordinary non-team inbox, plus ownership/abuse/privacy safeguards. No test accounts or auth bypasses are included.
