# Research notes — 10 August 2026

## Stack decisions

- **Phaser + TypeScript + Vite:** the game-studio guidance routes 2D browser games here; it gives us a battle-tested render/input loop without forcing the HUD into canvas.
- **React + Vite:** the app shell owns auth, profile, progression, chat, rota, collection, and responsive DOM UI.
- **Supabase:** the free plan is a sensible early service boundary for email/magic-link Auth, Postgres persistence, Realtime Presence/Broadcast, and storage. The client has a local guest path so provider setup cannot block playtesting.

## AI-assisted development scan

The current GitHub scan surfaced these useful workflow references:

- [OpenGame](https://github.com/leigest519/OpenGame) — Apache-2.0 agentic framework for end-to-end web-game creation, including reusable template/debug skills and headless browser evaluation. We borrow the principle of a living, verified debug protocol; we do not copy model weights, datasets, or code into the game bundle.
- [Claude Code Game Studios](https://github.com/Donchitos/Claude-Code-Game-Studios) — MIT workflow repository with a large agent/skill hierarchy. We borrow role separation, issue ledgers, and release gates; we do not ship its tooling as game runtime code.
- [Game Studio Sub-Agents](https://github.com/pamirtuna/gamestudio-subagents) — MIT role-based game-development workflow. We borrow the idea of specialised design, art, engineering, QA, and market-review passes.
- [awesome-ai-game-generation](https://github.com/Anil-matcha/awesome-ai-game-generation) — useful discovery index, not a licence guarantee. Every tool, model, generated output, sound, font, and dataset still needs its own review.

## Current product decision

The useful insight is not “generate more content.” It is “make the agent prove the playable loop.” LOW WATER therefore keeps a small yard, explicit simulation, screenshot-based QA, and a production contract in `AGENTS.md`.

## Service caveats

Supabase Free is appropriate for an early social prototype, not an authoritative competitive game server. Realtime message and connection limits, project pausing, abuse controls, chat moderation, and server-side economy validation must be measured before public launch. See [Supabase pricing](https://supabase.com/pricing), [Realtime pricing](https://supabase.com/docs/guides/realtime/pricing), [Realtime limits](https://supabase.com/docs/guides/realtime/limits), and [Auth](https://supabase.com/docs/guides/auth).
