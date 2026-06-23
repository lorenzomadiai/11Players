# Dream World Cup XI

A local React + Vite sandbox for building a fantasy World Cup XI from a random national team, World Cup edition, and tactical formation.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. By default this project runs at:

```bash
http://127.0.0.1:5173/
```

## Available scripts

```bash
npm run dev
npm run build
npm run test:run
npm run typecheck:test
npm run check:stale-tests
npm run check
npm run preview
```

## Test guardrails

Use `npm run check` before merging feature branches. It runs the stale-test import detector, production build, test typecheck, and Vitest suite.

When a component or module is deleted, renamed, or split, run `npm run check:stale-tests` first. It reports test files that still import local files that no longer exist.

When behavior or function signatures change, run `npm run typecheck:test`. It typechecks test files too, which catches stale fixtures, old component props, and old engine function calls that `npm run build` intentionally excludes.

## Version 1 scope

- Random draw for national team, World Cup year, formation, and challenge.
- Mock squad data for Brazil 2002, France 1998, Spain 2010, and Argentina 2022.
- Interactive pitch with 11 lineup slots and duplicate-player prevention.
- Player cards with ratings, roles, positions, clubs, traits, and key stats.
- Chemistry, tactical fit, star power, challenge validation, and achievement badges.
- Match simulation with score, result reasons, stats, randomness, and commentary.
- Local state persistence with no backend.
