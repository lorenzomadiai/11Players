# Match Model Research Notes

These notes record practical modeling assumptions for the 11Players tactical engine. The game does not have real event or tracking data, so these ideas must be translated into deterministic approximations from squad, player, formation, and style data.

## Sources Checked

- Sky Sports advanced stats explainer: xG, xGOT, xA, pressures, possessions.
- Expected goals overview and model notes: common xG inputs, probability interpretation, calibration limits.
- Academic xG papers on finishing bias and possession-level shot occurrence modeling.

## Practical Takeaways

- xG is a pre-shot probability for a chance, usually between 0 and 1.
- Good public descriptions consistently mention distance, angle, body part, assist type, phase/pattern of play, one-on-one situations, set pieces, penalties, and headers as important xG factors.
- xA should credit the creator/pass that produces the eventual shot; it is not the same as an actual assist.
- xGOT is post-shot and belongs to goalkeeper/shot-placement analysis. The current game should not claim xGOT until shot placement is modeled separately.
- Single-match goals can differ heavily from xG. The simulation lab must measure calibration over many runs, not one match.
- Player finishing skill can matter, but research warns against over-reading goals minus xG from small samples. In this game, finishing should affect conversion probability modestly and transparently.

## Game Translation

- Existing tactical events already approximate chance type, creator, scorer, pressure, keeper resistance, and xG.
- Tournament progression should aggregate xG and xA-like creator credit from those events.
- Future tuning should keep penalties near the common 0.76-0.79 range and avoid extremely high open-play xG unless the event is a clear penalty-like chance.
- Every xG/xA field shown to users should be explained as model-estimated game logic, not real historical data.

## Later Simulation Lab Checks

- Favorite win rate by expected-goal edge.
- Upset rate where lower expected team wins.
- Average goals vs average xG.
- Penalty and extra-time frequency.
- Team stage reached compared with seed strength.
- Player scorer/xG/xA leaders across many tournaments.
