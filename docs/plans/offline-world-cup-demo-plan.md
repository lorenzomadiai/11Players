# Offline World Cup Demo Implementation Plan

This is the implementation plan for turning the current draft sandbox into a working offline tournament demo. Work should happen in dedicated branches from `barbaros-updates`, then merge back only after approval.

## Workflow Rule

Before and after every implementation batch:

1. Read `my_notes.md`.
2. Summarize any relevant user notes.
3. Add note-derived requirements to the next batch plan.
4. Leave `my_notes.md` untouched unless explicitly asked to edit it.

Current note-derived requirements:

- Preselect future opponents in the background during the user draft flow, triggered by Continue Draft actions.
- Let difficulty affect opponent strength selection while still obeying practical World Cup group draw rules.
- Build a separate large simulation/statistics environment after the core engine work; this belongs on its own parent branch from `barbaros-updates`, not inside this demo implementation parent branch.
- Plan UI only after the engine and logic are understandable enough to make the interface clear.

## Batch 1: Data Foundation

Status: implemented on `feature/tournament-demo-foundation`.

- Add 12 player stats for richer match logic.
- Derive new stats from existing data first.
- Add squad confederation metadata for tournament draw rules.
- Add invariants so future squad data cannot miss required match fields.

## Batch 2: Tournament Draw Foundation

Status: implemented on `feature/tournament-demo-foundation`.

- Add seeded RNG utilities for reproducible tournaments.
- Add tournament state/types for teams, groups, standings, matches, and rounds.
- Build a 32-team tournament field by replacing one random historical squad with the user's Dream XI.
- Draw 8 groups of 4 from strength-seeded pots.
- Enforce practical FIFA-style confederation limits: max one per confederation per group, except UEFA max two.
- Add tests for reproducibility, no duplicates, pot distribution, replacement, and confederation limits.

## Batch 3: Opponent XI Builder

Status: implemented on `feature/opponent-xi-builder`.

- Auto-select opponent formation and legal XI.
- Evaluate opponent XI with the same core evaluation rules as the user's XI.
- Keep output deterministic from tournament seed and opponent squad.

## Batch 4: Tactical Match Engine

Status: implemented on `feature/tactical-match-engine`.

- Replace abstract opponent simulation with XI-vs-XI events.
- Generate chance types, scorers, assists, xG, goal reasons, and key matchup explanations.
- Support knockout extra time and penalties.

## Batch 5: Tournament Progression Engine

Status: implemented on `feature/tournament-progression-engine`.

- Use tactical match results to simulate group and knockout matches.
- Calculate group standings from points, goal difference, goals scored, and seeded strength tiebreakers.
- Generate Round of 16, Quarter Final, Semi Final, and Final fixtures.
- Track stage reached for every team.
- Aggregate goals, xG, and xA-style creator credit for future reporting.
- Start difficulty-sensitive tournament setup while preserving group draw rules.

## Batch 6: Tournament UI

Status: implemented on `feature/tournament-ui-integration`, pending merge into `feature/tournament-demo-foundation`.

- Show tournament result summary, user group table, knockout bracket, match timeline, scorers, and xG context.
- Keep user match details prominent while still making the wider tournament readable.

## Batch 7: Demo Polish

- Balance match numbers.
- Verify mobile and desktop layouts.
- Add restart/continue tournament handling.
- Run `npm run check` before merge.

## Separate Parent Branch: Simulation Lab

Status: planned as its own parent branch from `barbaros-updates`, not as a child branch under `feature/tournament-demo-foundation`.

Planned branch name: `tooling/simulation-lab`.

- Run 200-300 tournament simulations against the current dataset and engine.
- Output detailed JSON reports for every tournament, team, match, goal, scorer, xG total, expected favorite, actual winner, upset classification, and stage reached.
- Aggregate team-level statistics: titles, finals, semifinals, group exits, average goals for, average goals against, average xG, upset wins, upset losses, and expected-vs-actual performance.
- Aggregate match-level statistics: average goals, average xG, clean sheets, penalty decisions, extra-time matches, favorite win rate, draw rate before knockout resolution, and biggest margins.
- Keep this heavy testing environment out of the normal app code path unless explicitly merged later.
