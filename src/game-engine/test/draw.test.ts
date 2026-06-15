import { describe, expect, it } from 'vitest';
import { squads } from '../../data/mockData';
import { randomItem } from '../../utils/random';
import { createRandomDraw } from '../draw';
import { formations } from '../formations';
import { sequenceRng } from '../../test/fixtures';

describe('random draw', () => {
  it('throws instead of silently drawing from an empty pool', () => {
    expect(() => randomItem([])).toThrow('Cannot pick a random item from an empty array.');
  });

  it('can be reproduced with an injected RNG', () => {
    const draw = createRandomDraw(sequenceRng([0, 0, 0]));

    expect(draw).toEqual({
      squadId: squads[0].id,
      formationId: formations[0].id,
      challengeId: 'no-ballon-dor',
    });
  });

  it('uses each RNG pull for squad, formation, and challenge in order', () => {
    const draw = createRandomDraw(sequenceRng([0.99, 0.99, 0]));

    expect(draw.squadId).toBe(squads[squads.length - 1].id);
    expect(draw.formationId).toBe(formations[formations.length - 1].id);
    expect(draw.challengeId).toMatch(/^[a-z0-9-]+$/);
  });
});

