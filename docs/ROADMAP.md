# Production gates

## Gate 0 — playable proof (current)

- [x] Enter a run without an account.
- [x] Move through a yard and collect physical-looking finds.
- [x] Bank, push tide, extract, restart.
- [x] Show XP/rank, crew chat, daily rota, and found book surfaces.
- [x] Keep a local guest fallback when Supabase is not configured.
- [x] Record asset provenance and third-party notices.

## Gate 1 — make the loop genuinely multiplayer

- [ ] Add room creation, invite code, presence, reconnect, mute, block, report, and rate limiting.
- [ ] Move the run simulation to an authoritative server or Edge Function before competitive rankings.
- [ ] Add shared sorting, handoff XP, matched-pair finds, quick pings, downed/rescue state, and two-player Push confirmation.
- [ ] Persist only server-validated XP, Marks, cosmetics, rota progress, and discoveries.

## Gate 2 — prove replayability

- [ ] Create three search zones, twelve find archetypes, four matched-pair sets, and three telegraphed tide phases.
- [ ] Add soft kits (Gloves, Hook, Lamp) that change playstyle without creating a dominant class.
- [ ] Add run recap: best find, closest escape, most useful handoff, and crew haul.
- [ ] Add accessibility: controller input, colour-safe category markings, reduced motion, readable audio cues, and touch controls.
- [ ] Test five-minute return behaviour with at least three human testers and record findings.

## Gate 3 — public-service quality

- [ ] Add moderation, retention rules, privacy copy, account deletion, and a child-safety review before public chat.
- [ ] Add error reporting, performance budget, reconnect telemetry, and a safe migration plan for Supabase limits.
- [ ] Audit the full npm dependency tree and all future music, sound, font, and art inputs.
- [ ] Add preview deployment and CI only after the repository is connected to its intended GitHub/Vercel project.

## Deliberately deferred

Open world, clans, crafting, battle pass, shops, adverts inside a run, ranked PvP, voice chat, and procedural generation are not part of the proof gate. They need a validated core loop first.
