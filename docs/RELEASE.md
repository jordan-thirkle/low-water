# Release and hosting runbook

## Source of truth

- GitHub: https://github.com/jordan-thirkle/low-water
- Default branch: `main`
- CI: `.github/workflows/ci.yml`
- Dependency updates: `.github/dependabot.yml`
- Hosting contract: `vercel.json`

The repository is public so the project can be inspected and iterated on openly. The project code, branding, lore, and original art remain proprietary unless a later release explicitly changes that policy. Third-party assets keep their own licences; see [`ASSET_MANIFEST.md`](ASSET_MANIFEST.md) and [`../THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md).

## Vercel project contract

The Vercel project is connected to `jordan-thirkle/low-water` with `main` as the intended production branch.

The project is under the intended team (`prj_IO0lOXjLszAUSACtYwRBQKdg7C8n` / `jordanthirkles-projects`). Every release must come from a Git-connected Vercel deployment whose commit SHA matches the reviewed GitHub commit. Until that source-backed deployment is verified, do not use a generated shell/probe URL as the public playtest link.

- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: Vite
- Node version: `.nvmrc` (`22`)
- Preview builds: every pull request or non-production branch
- Production builds: only from `main` after CI passes

After changing the Vercel Git connection or project settings, push a reviewed commit to `main` and verify the resulting deployment before sharing it. The repository contract pins Node to 22 through `.nvmrc` and `package.json`; the Vercel project setting should match that pin rather than silently selecting a newer major.

The Phaser runtime is loaded from the pinned jsDelivr URL in `index.html`. React, React DOM, and the optional Supabase client are pinned in the import map. The npm packages remain installed for local type checks and CI; the browser runtimes are externalized so the connector can publish a small preview and mobile clients avoid a duplicate vendor bundle. If the project later needs offline-first hosting or a stricter third-party runtime policy, self-host the exact pinned files and update the asset manifest before release.

The optional `globalThis.__LOW_WATER_ASSET_BASE__` and `globalThis.__LOW_WATER_ASSET_EXTENSION__` overrides exist for lightweight smoke previews only. Normal local and Git-connected Vercel builds leave them unset and serve the checked-in `/assets/generated` PNG/JPEG source derivatives. WebP files are available for delivery experiments when the preview override is explicitly enabled.

No secret is needed for the guest/local build. Optional Supabase values belong only in Vercel Environment Variables and must use the public client key:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Never add a Supabase service-role key, OpenAI key, webhook secret, or other private credential to the browser bundle.

## Release checklist

1. Run `npm ci` with the current Node version.
2. Run `npm run test` and `npm run build`.
3. Open the preview on a desktop viewport and a narrow mobile viewport.
4. Play one complete run: enter, move, collect, bank or push, extract or fail, receive XP, and understand the next action.
5. Check browser console errors, asset loading, touch movement, and offline guest fallback.
6. Review `docs/ASSET_MANIFEST.md`, `THIRD-PARTY-NOTICES.md`, and the diff for licence or secret mistakes.
7. Merge only after CI and the playtest evidence pass.

## What is intentionally not production-ready

The current preview is a vertical slice, not a promise of MMO-scale multiplayer. Supabase Realtime is an optional transport for the prototype; authoritative simulation, moderation, account deletion, privacy copy, reconnect handling, and server-validated progression remain release gates in [`ROADMAP.md`](ROADMAP.md).
