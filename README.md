# LOW WATER

LOW WATER is a browser-first 1–4 player co-op salvage run. Scout a damp canal yard, pick up lost objects, return them to the sorting table, and make the important call: bank the haul or push the tide for better finds.

The project is deliberately anti-neon and anti-slop: grounded materials, a limited printed palette, physical landmarks, authored prop art, and a reward loop based on discovery, teamwork, mastery, and close calls rather than loot boxes or forced scarcity.

## Current vertical slice

- React + Vite app shell with a responsive DOM HUD.
- Phaser 3 playable top-down yard.
- W/A/S/D, arrow keys, pointer movement, auto-pickup, `E` bank, `Q` push tide, `X` extract.
- Local guest progress saved to versioned local storage.
- Optional Supabase email magic-link auth and Realtime room/chat/player-position transport.
- Crew notes, daily rota, found book, rank XP, run recap hooks, and offline-safe chat.
- Curated Kenney CC0 packs included with their licence files.

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The game is intentionally usable without provider credentials. To enable email auth and live Realtime chat, copy `.env.example` to `.env.local` and add a Supabase project URL and publishable/anon key.

## Build and verify

```bash
npm run build
npm run test
```

The project is not release-ready yet. It is a playable proof of the loop. The production gates are listed in [`docs/ROADMAP.md`](docs/ROADMAP.md), and the asset/license evidence is in [`docs/ASSET_MANIFEST.md`](docs/ASSET_MANIFEST.md).

## Product rules

1. Banked haul, XP, rota progress, and collection discoveries are never removed after a failed run.
2. Push is telegraphed risk with a hard cap, not a random punishment.
3. Authentication is optional until the player has seen the core game.
4. Multiplayer transport may start on Supabase Realtime, but authoritative simulation and anti-cheat move to a dedicated server before scale.
5. Every shipped asset and dependency has a recorded source, licence, and attribution decision.

See [`AGENTS.md`](AGENTS.md) for the AI team operating contract.
