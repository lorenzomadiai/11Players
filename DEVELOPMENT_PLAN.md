# 11Players Development Plan

Last updated: 2026-06-28

This is the shared project plan for agents working on 11Players. Treat this file as the high-level coordination document. More detailed engine plans live under `docs/plans/` on the active feature branches.

## Branching Rules

- `main` must not be pushed to directly.
- `barbaros-updates` is the project integration branch.
- Feature work must be developed on named branches and pushed there first.
- The current first playable-demo implementation parent branch is `feature/tournament-demo-foundation`.
- Child branches for that first implementation are branched from `feature/tournament-demo-foundation`, pushed independently, then merged back into `feature/tournament-demo-foundation`.
- `feature/tournament-demo-foundation` will be merged into `barbaros-updates` only after explicit approval.
- The heavy simulation/statistics lab must be its own parent branch from `barbaros-updates`, not a child of `feature/tournament-demo-foundation`.

## Always Check User Notes

Before and after each implementation batch:

1. Read `my_notes.md`.
2. Summarize relevant notes.
3. Fold new requirements into the plan before coding.
4. Do not edit `my_notes.md` unless explicitly asked.

Current important notes:

- Opponent preparation should happen progressively in the background during draft interactions, especially on Continue Draft actions.
- Difficulty should affect opponent strength selection while still respecting practical World Cup group draw rules.
- A separate simulation lab should run 200-300 tournament simulations and output detailed JSON/statistical reports.
- UI work should happen after the engine and logic are understandable enough to represent clearly.

## Current Product Direction

Build an offline playable World Cup-style demo before online/multiplayer work.

The user drafts one Dream XI. That XI eventually enters a full 32-team tournament by replacing one historical squad. The tournament uses historical World Cup squad/year opponents, group draw rules, opponent XIs, tactical match simulation, event timelines, scorers, assists, xG, and explainable result reasons.

## Implemented Branches

### `feature/tournament-demo-foundation`

Parent branch for the first implementation. Currently pushed and ahead of `barbaros-updates`.

Implemented:

- 12-stat player model foundation.
- Derived expanded stats from existing six-stat player data.
- Squad confederation metadata.
- Tournament field creation.
- Strength-seeded group pots.
- Practical FIFA-style confederation group limits.
- Deterministic seeded RNG.
- Opponent XI builder.
- Tactical XI-vs-XI match engine.

### `feature/opponent-xi-builder`

Child branch merged into `feature/tournament-demo-foundation`.

Implemented:

- Auto-selected opponent formation.
- Legal 11-player opponent lineup generation.
- Deterministic best-XI selection.
- Opponent evaluation using the same engine as the user XI.

### `feature/tactical-match-engine`

Child branch merged into `feature/tournament-demo-foundation`.

Implemented:

- Tactical team profiles.
- Chance types.
- Event timelines.
- Scorers and assists.
- xG per event.
- Goal reasons and event metrics.
- Knockout extra time and penalties.

## Next Engine Batch

Next recommended branch:

`feature/tournament-progression-engine`

Branch from:

`feature/tournament-demo-foundation`

Goals:

- Use the tactical match engine to simulate tournament matches.
- Calculate group standings.
- Advance teams to knockouts.
- Generate Round of 16, Quarter Final, Semi Final, and Final fixtures.
- Track stage reached per team.
- Keep deterministic behavior from tournament seed.
- Start threading difficulty into tournament/opponent selection, without breaking group draw rules.

Before implementing match probability/xG/xA refinements, do targeted football analytics research and document the practical model assumptions.

## Separate Simulation Lab

Planned branch:

`tooling/simulation-lab`

Branch from:

`barbaros-updates`

Purpose:

- Run 200-300 tournament simulations.
- Output detailed JSON for each tournament and match.
- Track teams, stages reached, goals, goals conceded, xG, expected favorite, actual result, unexpected wins, finals, titles, and aggregate averages.
- Keep this heavy tooling separate from the normal app/demo branch unless explicitly approved later.

## Quality Gate

Before pushing any implementation branch:

```bash
npm run check
```

This runs stale test import checks, production build, test typecheck, and the Vitest suite.

## Research Rule For Match Logic

For xG, xA, chance quality, event modeling, and match probability logic:

- Prefer reputable football analytics sources and public methodology explanations.
- Convert research into simple deterministic rules that fit this game’s available dataset.
- Do not pretend the game has real tracking/event data when it does not.
- Keep the first model explainable, testable, and easy to tune.
- Store detailed implementation assumptions in `docs/plans/` or a future simulation-lab report.
