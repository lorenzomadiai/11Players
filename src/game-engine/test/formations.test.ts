import { describe, expect, it } from 'vitest';
import { createEmptyLineup, formations, getFormationById } from '../formations';
import type { Position } from '../../types/game';

const validPositions: Position[] = ['GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'DM', 'CM', 'AM', 'LM', 'RM', 'LW', 'RW', 'ST'];

describe('formations', () => {
  it('keeps every formation as a valid 11-slot tactical shape', () => {
    expect(formations.length).toBeGreaterThan(0);
    expect(new Set(formations.map((formation) => formation.id)).size).toBe(formations.length);

    formations.forEach((formation) => {
      expect(formation.slots).toHaveLength(11);
      expect(new Set(formation.slots.map((slot) => slot.id)).size).toBe(11);

      formation.slots.forEach((slot) => {
        expect(slot.acceptedPositions.length).toBeGreaterThan(0);
        slot.acceptedPositions.forEach((position) => expect(validPositions).toContain(position));
        expect(slot.x).toBeGreaterThanOrEqual(0);
        expect(slot.x).toBeLessThanOrEqual(100);
        expect(slot.y).toBeGreaterThanOrEqual(0);
        expect(slot.y).toBeLessThanOrEqual(100);
      });
    });
  });

  it('creates an empty lineup with exactly the formation slot ids', () => {
    const formation = getFormationById('433');

    expect(formation).toBeDefined();
    const lineup = createEmptyLineup(formation!);

    expect(Object.keys(lineup).sort()).toEqual(formation!.slots.map((slot) => slot.id).sort());
    expect(Object.values(lineup).every((playerId) => playerId === null)).toBe(true);
  });
});

