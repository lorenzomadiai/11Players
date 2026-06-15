import { describe, expect, it } from 'vitest';
import { getSquadById, squads } from '../mockData';
import type { Position } from '../../types/game';

const validPositions: Position[] = ['GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'DM', 'CM', 'AM', 'LM', 'RM', 'LW', 'RW', 'ST'];

describe('squad data invariants', () => {
  it('keeps squad and player ids unique and resolvable', () => {
    expect(squads.length).toBeGreaterThan(0);
    expect(new Set(squads.map((squad) => squad.id)).size).toBe(squads.length);

    const allPlayerIds = squads.flatMap((squad) => squad.players.map((player) => player.id));
    expect(new Set(allPlayerIds).size).toBe(allPlayerIds.length);

    squads.forEach((squad) => {
      expect(getSquadById(squad.id)).toBe(squad);
      expect(new Set(squad.players.map((player) => player.id)).size).toBe(squad.players.length);
    });
  });

  it('keeps every squad large enough and every player inside valid rating/stat/position bounds', () => {
    squads.forEach((squad) => {
      expect(squad.players.length).toBeGreaterThanOrEqual(11);
      expect(squad.baseStrength).toBeGreaterThanOrEqual(0);
      expect(squad.baseStrength).toBeLessThanOrEqual(100);

      squad.players.forEach((player) => {
        expect(player.countryCode).toBe(squad.countryCode);
        expect(player.worldCupYear).toBe(squad.year);
        expect(player.rating).toBeGreaterThanOrEqual(0);
        expect(player.rating).toBeLessThanOrEqual(100);
        expect(player.positions.length).toBeGreaterThan(0);
        player.positions.forEach((position) => expect(validPositions).toContain(position));
        Object.values(player.stats).forEach((stat) => {
          expect(stat).toBeGreaterThanOrEqual(0);
          expect(stat).toBeLessThanOrEqual(100);
        });
      });
    });
  });
});

