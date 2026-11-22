# ByDose

Street roots. Open possibilities. DOSE Art is the first space inside ByDose, not the whole of it.

## Run and check

Node.js 20.9+; `npm ci`, `npm run dev`, `npm run test:foundation`, `npm run build`, `npm audit`, and `git diff --check`.

## Routes

- `/` and `/intro`: preserved animated DOSE mandala; **Enter ByDose** opens the umbrella landing page.
- `/hub`: direct ByDose landing page, DOSE Art entrance, deliberately disabled coming-soon spaces, and **Suggest an idea**.
- `/community`: real account/profile/artwork integration foundation. Preview backend setup is still required, and controls stay unavailable until activated.
- `/suggestions`: real private, authenticated suggestion form and own submission history; unavailable until backend activation. No pretend saving.
- `/art-preview`: street-first interactive design demo with fictional artists, six original SVG studies, graffiti/mural/blackbook filters, and memory-only likes/saves/follows/comments/composer. No real uploads; state resets on reload. Photography uses an illustrated placeholder, not a photograph.
- `/collection`: preserved Secret Nine project concept; artist entries are not open.

## Backend status

A dedicated Supabase Free resource is connected to **Preview only**. No hosted SQL migrations, Auth redirect settings, real accounts, emails, or uploads have been verified. Follow [`supabase/ACTIVATE.md`](supabase/ACTIVATE.md) and the two-account checks in [`supabase/SETUP.md`](supabase/SETUP.md).

The application uses only public Supabase URL/publishable-key variables. `NEXT_PUBLIC_BYDOSE_BACKEND_READY=true` is a deployment readiness gate, not authorization. Supabase RLS and storage policies enforce ownership; never put a service-role key in client code. Keep the preview invitation-only until privacy, moderation, abuse, and deletion safeguards are ready.

`test:foundation` executes both actual migrations against embedded PostgreSQL with modeled Auth/Storage schemas and tests upload type/size validation. It covers private suggestions, ownership/spoofing denials and a five-per-day DB-enforced limit. It does not verify the hosted provider.

Artwork/profiles and their media URLs are public; suggestions are private to their author and the site operator. The operator reviews suggestions in provider tooling, not an unsecured browser admin panel.

## Assets

The six SVG artwork studies are original illustrations, not user submissions. Barlow Condensed 900 Latin is self-hosted under the SIL Open Font License (`public/fonts/OFL.txt`). No external runtime font service is used.
