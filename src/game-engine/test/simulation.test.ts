import { describe, expect, it } from 'vitest';
import { evaluateLineup } from '../evaluation';
import { simulateMatch } from '../simulation';
import { brazil433Lineup, requireDifficulty, requireFormation, requireSquad, sequenceRng } from '../../test/fixtures';

describe('match simulation', () => {
  it('produces reproducible results when the RNG is injected', () => {
    const squad = requireSquad();
    const formation = requireFormation();
    const difficulty = requireDifficulty();
    const evaluation = evaluateLineup(squad, formation, brazil433Lineup(), difficulty, 'no-ballon-dor');

    const result = simulateMatch(squad, formation, evaluation, difficulty, false, sequenceRng([0.5, 0.5, 0.5, 0]));

    expect(result.stats.randomSwing).toBe(0);
    expect(result.opponentName).toBe('a tournament superteam');
    expect(result.teamGoals).toBeGreaterThanOrEqual(0);
    expect(result.teamGoals).toBeLessThanOrEqual(6);
    expect(result.opponentGoals).toBeGreaterThanOrEqual(0);
    expect(result.opponentGoals).toBeLessThanOrEqual(5);
    expect(result.outcome).toBe(
      result.teamGoals > result.opponentGoals ? 'win' : result.teamGoals === result.opponentGoals ? 'draw' : 'loss',
    );
  });

  it('includes target-mode reasoning only when exact score mode is enabled', () => {
    const squad = requireSquad();
    const formation = requireFormation();
    const difficulty = requireDifficulty('expert');
    const evaluation = evaluateLineup(squad, formation, brazil433Lineup(), difficulty, 'no-ballon-dor');

    const result = simulateMatch(squad, formation, evaluation, difficulty, true, sequenceRng([0.4, 0.4, 0.4, 0.4]));

    expect(result.reasons).toContain('Score target mode encouraged extra risk while chasing the exact 7-0 finish.');
    expect(result.stats.opponentStrength).toBeGreaterThanOrEqual(68);
    expect(result.stats.opponentStrength).toBeLessThanOrEqual(95);
    expect(result.achievements.some((achievement) => achievement.id === 'target-7-0')).toBe(true);
  });
});

