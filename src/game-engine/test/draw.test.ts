import { afterEach, describe, expect, it, vi } from 'vitest';
import { squads } from '../../data/mockData';
import { randomItem } from '../../utils/random';
import { changeTeamDraw, changeYearDraw, createDraw, nextRandomDraw } from '../draw';
import { freePlayChallenge } from '../challenges';
import { sequenceRng } from '../../test/fixtures';

describe('random draw', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throws instead of silently drawing from an empty pool', () => {
    expect(() => randomItem([])).toThrow('Cannot pick a random item from an empty array.');
  });

  it('creates a free-play draw for the selected formation', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const draw = createDraw('433');

    expect(draw).toEqual({
      squadId: squads[0].id,
      formationId: '433',
      challengeId: freePlayChallenge.id,
    });
  });

  it('draws a different squad after a pick while preserving formation and challenge mode', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const draw = nextRandomDraw({ squadId: squads[0].id, formationId: '4231', challengeId: freePlayChallenge.id });

    expect(draw.squadId).not.toBe(squads[0].id);
    expect(draw.formationId).toBe('4231');
    expect(draw.challengeId).toBe(freePlayChallenge.id);
  });

  it('rerolls team or year without spending the selected formation', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const currentDraw = { squadId: squads[0].id, formationId: '352', challengeId: freePlayChallenge.id };

    expect(changeTeamDraw(currentDraw).formationId).toBe('352');
    expect(changeYearDraw(currentDraw).formationId).toBe('352');
  });
});
