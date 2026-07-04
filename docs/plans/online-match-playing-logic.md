# Online Match Playing Logic Plan

This document captures the early design for the future online-ready match engine. It should be used after the offline tournament demo foundation is in place.

## Core Chain

Every match should be explainable through the same chain:

`squad data -> XI profile -> formation matchup -> chance creation -> xG -> goals -> result explanation`

The engine must be able to explain:

- why one XI has a higher win chance than another
- why a draw or upset is still possible
- why the final margin is narrow or wide
- who scored, who assisted, and which matchup created the goal
- which metrics mattered most in the result

## Match Factors

- **Player quality:** rating plus 12 stats: pace, shooting, passing, defense, physical, technique, finishing, chanceCreation, setPieces, aerial, goalkeeping, workRate.
- **Position fit:** natural roles keep full value; secondary roles lose a little; same-line compromises lose more; tactical mismatches lose heavily.
- **Formation matchup:** compare zones using formation coordinates: wide attackers vs fullbacks, central creators vs DMs, strikers vs CBs and keeper, midfield line vs midfield line.
- **Team style:** defensive reduces chance volume and conceded xG; balanced stays stable; attacking creates more and concedes more transition risk.
- **Chemistry:** same club, era, leadership, low mismatch count, and fitting shape improve chance quality and reduce bad turnovers.
- **Line strengths:** attack, midfield control, defensive resistance, keeper score, set-piece threat, counter threat, and pressing/work rate.

## Algorithm Sketch

1. Build `TeamProfile` for both XIs.
2. Compute matchup deltas:
   - attack vs defense
   - midfield vs midfield
   - wide threat vs wide defense
   - central creation vs central block
   - set pieces vs aerial defense
   - finishing vs keeper
3. Convert matchup deltas into expected chance volume and chance quality.
4. Generate match events with a seeded RNG.
5. For each event:
   - choose chance type
   - choose creator
   - choose scorer
   - calculate defender pressure
   - calculate keeper resistance
   - calculate xG
   - roll goal outcome
6. Sum goals from events.
7. Build result explanations from the largest matchup deltas and decisive events.

## Win Probability

Before a match, run a fast seeded Monte Carlo preview, for example 1,000 simulations.

Example output:

```text
Team A win: 54%
Draw: 23%
Team B win: 23%
Expected goals: Team A 1.9, Team B 1.2
Likely score band: 2-1, 1-1, 2-0
```

The probability must be backed by visible reasons, such as:

- Team A has +11 midfield control.
- Team A has +9 chance creation.
- Team A has +14 finishing advantage against the opponent keeper.
- Team B still has counter threat, so the favorite is not safe.

## Result Examples

### Narrow Win

Team A has strong midfield control, an elite creator, and a good striker. Team B has a weaker midfield, but a strong keeper and fast forwards.

Expected logic:

```text
Team A controls more possession and creates 2.1 xG.
Team B creates 1.3 xG through counters.
Team A has a 58% win chance, but the keeper and counter speed keep the match close.
Likely result: 2-1.
```

Goal explanation:

```text
67' Team A goal
Creator: Zidane
Scorer: Ronaldo
Reason: Zidane's chanceCreation and passing beat central pressure. Ronaldo's finishing beat the CB/GK resistance.
```

### Draw

Team A has better stars but weak chemistry and several players out of position. Team B is balanced, defensive, and low-risk.

Expected logic:

```text
Team A has more talent, but loses tactical efficiency.
Team B blocks central chances and keeps xG low.
Team A xG: 1.4
Team B xG: 1.2
Draw chance rises to 31%.
Likely result: 1-1.
```

### Big Margin

Team A has a natural-position front three, high chemistry, strong midfield, and attacking style. Team B has mismatched defenders, a weak keeper, and low workRate.

Expected logic:

```text
Team A creates many high-quality chances.
Team B loses both wide and central matchups.
Team A xG: 3.3
Team B xG: 0.7
Team A win chance: 76%
Likely result: 3-0 or 3-1.
```

## Implementation Batches

1. **Team Profile Batch:** build `TeamProfile` from any XI with attack, midfield, defense, keeper, chemistry, style, set-piece threat, counter threat, and pressure.
2. **Matchup Batch:** compare formation against formation and calculate lane advantages plus key player duels.
3. **Chance Engine Batch:** generate chances by type, creator, shooter, defender pressure, and keeper resistance.
4. **Goal + xG Batch:** convert chances into goals and store scorer, assist, minute, chance type, xG, and reason.
5. **Probability Batch:** run many seeded simulations and expose win/draw/loss percentages plus likely score bands.
6. **Result Explanation Batch:** show score, xG, scorers, assists, top reasons, key matchup wins/losses, and margin explanation.
7. **Online-Ready Batch:** make results deterministic from Team A lineup, Team B lineup, match seed, and engine version.

## Online Determinism Rule

For online play, a match result must be reproducible from:

- Team A lineup
- Team B lineup
- both formations and styles
- match seed
- engine version

The same inputs must always produce the same result so neither player can reroll an outcome unfairly.
