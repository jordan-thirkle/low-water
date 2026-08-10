# LOW WATER — agent operating contract

This file is the shared source of truth for any AI agent working on the project. Read it before editing code, art, data, deployment configuration, or product copy.

## Outcome

Prove that the LOW WATER 90-second co-op salvage loop is fun, readable, and worth replaying before adding MMO-sized surface area. A passing build is not a completed milestone. The evidence is a player-observable loop: enter, move, find, bank or push, extract/fail, receive progression, and understand what to try next.

## Roles

- **Producer:** protects the current milestone, scope, acceptance criteria, and issue ledger.
- **Game designer:** owns player verbs, risk/reward, difficulty, progression, and anti-frustration rules.
- **Runtime engineer:** owns Phaser simulation/render separation, input, collisions, performance, and saveable state.
- **Web engineer:** owns React shell, auth, chat, responsive UI, accessibility, and provider boundaries.
- **Network engineer:** owns room transport, presence, message limits, reconnects, and authoritative-server migration notes.
- **Art/asset steward:** owns visual consistency, provenance, licence files, attribution, and asset manifest updates.
- **QA/playtest:** boots the game, performs the primary flow, captures desktop/mobile evidence, records console/runtime issues, and verifies fixes.
- **Growth/revenue reviewer:** checks retention hooks, shareable run recaps, and monetisation ideas without introducing pay-to-win, loot boxes, energy timers, or manipulative streak punishment.

## Working loop

1. Inspect the current tree, scripts, status, and relevant docs.
2. State the acceptance criteria and highest-risk failure modes.
3. Change one vertical slice through real behaviour.
4. Run the narrowest relevant check immediately.
5. Review the diff for unrelated edits, secrets, weak failure handling, and licence gaps.
6. Run build/type/test checks and a browser playtest with a screenshot.
7. Add unresolved issues to `docs/ROADMAP.md` rather than hiding them.
8. Report exactly what changed, what evidence passed, and what remains unverified.

## Boundaries

- Do not deploy, publish, push, merge, or change external services without explicit human authorisation.
- Never commit Supabase service-role keys, private credentials, provider tokens, or generated secrets.
- Never copy a repository, asset, character, logo, name, or prompt without a clear licence and an entry in `docs/ASSET_MANIFEST.md`.
- Prefer existing libraries and packs over bespoke replacements. Do not add a dependency to avoid reading the existing API.
- Phaser owns simulation-facing playfield behaviour. React owns text-heavy HUD, menus, profile, auth, progression, and chat.
- Do not call visual polish “done” until the core interaction has been played and screenshot-reviewed.

## Definition of done for a feature

- The user-visible behaviour exists in the real app.
- State has an explicit owner and can be serialized if it affects progression.
- Error/offline state is understandable.
- Desktop and narrow viewport behaviour were checked.
- The relevant test/build/playtest evidence is recorded in the handoff.
- Any new asset, dependency, schema, or provider requirement is documented.
