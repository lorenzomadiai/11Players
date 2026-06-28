import { describe, expect, it } from 'vitest';
import { getSquadById, squads } from '../mockData';
import type { Confederation, Position } from '../../types/game';

const validPositions: Position[] = ['GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'DM', 'CM', 'AM', 'LM', 'RM', 'LW', 'RW', 'ST'];
const validConfederations: Confederation[] = ['AFC', 'CAF', 'CONCACAF', 'CONMEBOL', 'OFC', 'UEFA'];
const requiredStats = [
  'pace',
  'shooting',
  'passing',
  'defense',
  'physical',
  'technique',
  'finishing',
  'chanceCreation',
  'setPieces',
  'aerial',
  'goalkeeping',
  'workRate',
] as const;

describe('squad data invariants', () => {
  it('keeps squad and player ids unique and resolvable', () => {
    expect(squads.length).toBeGreaterThanOrEqual(32);
    expect(new Set(squads.map((squad) => squad.id)).size).toBe(squads.length);
    expect(new Set(squads.map((squad) => squad.countryCode)).size).toBeGreaterThanOrEqual(32);

    const allPlayerIds = squads.flatMap((squad) => squad.players.map((player) => player.id));
    expect(new Set(allPlayerIds).size).toBe(allPlayerIds.length);

    squads.forEach((squad) => {
      expect(getSquadById(squad.id)).toBe(squad);
      expect(new Set(squad.players.map((player) => player.id)).size).toBe(squad.players.length);
    });
  });

  it('keeps a varied strength spread for tournament-style draws', () => {
    expect(squads.some((squad) => squad.baseStrength >= 88)).toBe(true);
    expect(squads.some((squad) => squad.baseStrength >= 80 && squad.baseStrength < 88)).toBe(true);
    expect(squads.some((squad) => squad.baseStrength < 80)).toBe(true);
  });

  it('keeps every squad large enough and every player inside valid rating/stat/position bounds', () => {
    squads.forEach((squad) => {
      expect(squad.players.length).toBeGreaterThanOrEqual(11);
      expect(validConfederations).toContain(squad.confederation);
      expect(squad.baseStrength).toBeGreaterThanOrEqual(0);
      expect(squad.baseStrength).toBeLessThanOrEqual(100);

      squad.players.forEach((player) => {
        expect(player.countryCode).toBe(squad.countryCode);
        expect(player.worldCupYear).toBe(squad.year);
        expect(player.rating).toBeGreaterThanOrEqual(0);
        expect(player.rating).toBeLessThanOrEqual(100);
        expect(player.positions.length).toBeGreaterThan(0);
        player.positions.forEach((position) => expect(validPositions).toContain(position));
        expect(Object.keys(player.stats).sort()).toEqual([...requiredStats].sort());
        Object.values(player.stats).forEach((stat) => {
          expect(stat).toBeGreaterThanOrEqual(0);
          expect(stat).toBeLessThanOrEqual(100);
        });
      });
    });
  });
});
