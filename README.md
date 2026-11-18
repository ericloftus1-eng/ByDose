# DOSE Art Collective

An art-first social community layout built with Next.js and React.

## Run locally

Use Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Use `npm run build` for the production build and `npm start` to serve it.

## Routes

- `/`: responsive social feed, medium and search filters, following feed, saved pieces, artist profiles, and a demo studio.
- `/intro`: the original animated DOSE experience and collective entry.
- `/collection`: the existing Secret Nine project concept, with artist entries still closed.

## Preview behavior

All artists and feed posts are fictional sample content. The three SVG studies in `public/art` are original layout illustrations; the Photography card is an illustrated placeholder, not a photograph or a submitted artwork.

Likes, saves, follows, comments, and composer posts work only in memory and reset on reload. The composer selects sample illustrations; it does not upload files or publish publicly. There is no authentication, database, messaging, or real social network yet.

## Design files

- `app/page.js`: social layout and demo interactions
- `app/social.module.css`: responsive, scoped social styles
- `app/intro/page.js` and `app/globals.css`: original intro
- `app/art.js` and `app/art.css`: Secret Nine concept

## Checks

Run `npm run build` and `git diff --check`. Browser verification should cover desktop and mobile, feed filters/search, likes and saves, following, profiles, comments, creating a demo post, and the preserved routes.
