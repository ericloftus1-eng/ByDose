# DOSE landing page

A Next.js starter containing the original Copilot design. Visual tuning, mobile sizing, and reduced-motion support are left for the next pass.

## Upload to GitHub

1. Extract the downloaded ZIP.
2. Open your empty GitHub repository and choose **uploading an existing file** (or **Add file → Upload files**).
3. Drag the contents of this folder into GitHub, including the `app` folder, then commit.
4. Make sure `package.json` is at the repository root, not inside a second `dose-landing` folder.

## Run locally

Use Node.js 20.9 or newer.

```
npm install
npm run dev
```

Open http://localhost:3000. Use `npm run build` for a production build.

## Edit the design

- `app/page.js`: text and pulse behavior
- `app/globals.css`: styling and animation
- `app/layout.js`: page title and description

This starter is not yet deployed or connected to a domain.
