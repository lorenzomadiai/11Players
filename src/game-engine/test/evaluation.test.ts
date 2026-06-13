import { describe, expect, it } from 'vitest';
import { getPlayerSlotFit, evaluateLineup } from '../evaluation';
import { brazil433Lineup, requireDifficulty, requireFormation, requirePlayer, requireSquad } from '../../test/fixtures';

describe('lineup evaluation', () => {
  it('grades natural, secondary, same-line, and mismatch slot fits', () => {
    const squad = requireSquad();
    const formation = requireFormation();
    const rbSlot = formation.slots.find((slot) => slot.id === 'rb')!;
    const stSlot = formation.slots.find((slot) => slot.id === 'st')!;
    const lbSlot = formation.slots.find((slot) => slot.id === 'lb')!;

    expect(getPlayerSlotFit(rbSlot, requirePlayer(squad, 'bra-2002-cafu'))).toMatchObject({
      compatibility: 1,
      message: 'Natural role fit',
    });
    expect(getPlayerSlotFit(stSlot, requirePlayer(squad, 'bra-2002-rivaldo'))).toMatchObject({
      compatibility: 0.9,
      message: 'Comfortable secondary role',
    });
    expect(getPlayerSlotFit(lbSlot, requirePlayer(squad, 'bra-2002-cafu'))).toMatchObject({
      compatibility: 0.64,
      message: 'Same line, awkward detail',
    });
    expect(getPlayerSlotFit(stSlot, requirePlayer(squad, 'bra-2002-marcos'))).toMatchObject({
      compatibility: 0.28,
      message: 'Tactical mismatch',
    });
  });

  it('scores a complete lineup and surfaces challenge penalties and achievements', () => {
    const squad = requireSquad();
    const formation = requireFormation();
    const evaluation = evaluateLineup(squad, formation, brazil433Lineup(), requireDifficulty(), 'no-ballon-dor');

    expect(evaluation.filledSlots).toBe(11);
    expect(evaluation.isComplete).toBe(true);
    expect(evaluation.duplicatePlayerIds).toEqual([]);
    expect(evaluation.challenge.passed).toBe(false);
    expect(evaluation.challenge.penalty).toBe(18);
    expect(evaluation.warnings).toContain('Challenge penalty active: No Ballon d\'Or Winners.');
    expect(evaluation.overall).toBeGreaterThan(70);
    expect(evaluation.achievements.find((achievement) => achievement.id === 'legend-stack')?.earned).toBe(true);
    expect(evaluation.achievements.find((achievement) => achievement.id === 'perfect-fit')?.earned).toBe(true);
  });

  it('marks duplicate players as illegal even when all slots are filled', () => {
    const squad = requireSquad();
    const formation = requireFormation();
    const lineup = {
      ...brazil433Lineup(),
      cb2: 'bra-2002-lucio',
    };

    const evaluation = evaluateLineup(squad, formation, lineup, requireDifficulty(), 'defensive-core');

    expect(evaluation.filledSlots).toBe(11);
    expect(evaluation.isComplete).toBe(false);
    expect(evaluation.duplicatePlayerIds).toEqual(['bra-2002-lucio']);
    expect(evaluation.warnings).toContain('Duplicate player detected: Lucio.');
  });
});

