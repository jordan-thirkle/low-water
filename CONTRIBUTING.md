# Contributing to LOW WATER

LOW WATER is developed as a small, evidence-led game studio project. Keep the
90-second salvage loop readable before adding surface area.

## Local workflow

```bash
npm ci
npm run test
npm run dev
npm run build
```

Use feature branches and pull requests. Every gameplay change should explain
the player-visible behaviour, the failure mode it addresses, and the evidence
used to verify it on desktop and a narrow viewport.

## Boundaries

- Keep Phaser responsible for playfield simulation and React responsible for
  text-heavy UI, auth, progression, and chat.
- Do not commit `.env` files, Supabase service-role keys, provider tokens, or
  generated secrets.
- Record every new asset, font, sound, dependency, or provider requirement in
  `docs/ASSET_MANIFEST.md` or `THIRD-PARTY-NOTICES.md`.
- Avoid pay-to-win systems, loot boxes, energy timers, and manipulative streak
  punishment.

See `AGENTS.md` for the complete operating contract.
