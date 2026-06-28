# Offline World Cup Demo Implementation Plan

This is the implementation plan for turning the current draft sandbox into a working offline tournament demo. Work should happen in dedicated branches from `barbaros-updates`, then merge back only after approval.

## Workflow Rule

Before and after every implementation batch:

1. Read `my_notes.md`.
2. Summarize any relevant user notes.
3. Add note-derived requirements to the next batch plan.
4. Leave `my_notes.md` untouched unless explicitly asked to edit it.

Current note-derived requirements: none. The file is empty as of this batch.

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

- Auto-select opponent formation and legal XI.
- Evaluate opponent XI with the same core evaluation rules as the user's XI.
- Keep output deterministic from tournament seed and opponent squad.

## Batch 4: Tactical Match Engine

- Replace abstract opponent simulation with XI-vs-XI events.
- Generate chance types, scorers, assists, xG, goal reasons, and key matchup explanations.
- Support knockout extra time and penalties.

## Batch 5: Tournament UI

- Show group draw, tables, bracket, next opponent, match timeline, scorers, and result reasons.
- Keep user match details prominent and other matches readable.

## Batch 6: Demo Polish

- Balance match numbers.
- Verify mobile and desktop layouts.
- Add restart/continue tournament handling.
- Run `npm run check` before merge.
