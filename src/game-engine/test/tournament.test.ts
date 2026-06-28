import { describe, expect, it } from 'vitest';
import type { Confederation, TournamentGroup } from '../../types/game';
import { canPlaceTeamInGroup, createTournament } from '../tournament';

const confederationCounts = (group: TournamentGroup) =>
  group.teams.reduce<Record<Confederation, number>>(
    (counts, team) => ({
      ...counts,
      [team.confederation]: (counts[team.confederation] ?? 0) + 1,
    }),
    {} as Record<Confederation, number>,
  );

describe('tournament draw', () => {
  it('creates a reproducible 32-team tournament with the Dream XI replacing one squad', () => {
    const first = createTournament({ seed: 'demo-seed', userTeamStrength: 86 });
    const second = createTournament({ seed: 'demo-seed', userTeamStrength: 86 });

    expect(first).toEqual(second);
    expect(first.teams).toHaveLength(32);
    expect(first.groups).toHaveLength(8);
    expect(first.groupMatches).toHaveLength(48);
    expect(first.knockoutMatches).toEqual([]);
    expect(first.teams.filter((team) => team.kind === 'dream-xi')).toHaveLength(1);
    expect(first.teams.some((team) => team.squadId === first.replacedSquadId)).toBe(false);
  });

  it('draws eight groups of four with one team from each strength pot', () => {
    const tournament = createTournament({ seed: 'pot-check', userTeamStrength: 84 });

    tournament.groups.forEach((group) => {
      expect(group.teams).toHaveLength(4);
      expect(group.teams.map((team) => team.pot).sort()).toEqual([1, 2, 3, 4]);
    });

    const teamIds = tournament.groups.flatMap((group) => group.teams.map((team) => team.id));
    expect(new Set(teamIds).size).toBe(32);
  });

  it('respects practical FIFA-style confederation limits', () => {
    const tournament = createTournament({ seed: 'confed-check', userTeamStrength: 82 });

    tournament.groups.forEach((group) => {
      const counts = confederationCounts(group);

      Object.entries(counts).forEach(([confederation, count]) => {
        expect(count).toBeLessThanOrEqual(confederation === 'UEFA' ? 2 : 1);
      });
    });
  });

  it('allows two UEFA teams in a group but blocks duplicate non-UEFA confederations', () => {
    const tournament = createTournament({ seed: 'placement-check', userTeamStrength: 86 });
    const uefaTeams = tournament.teams.filter((team) => team.confederation === 'UEFA');
    const conmebolTeams = tournament.teams.filter((team) => team.confederation === 'CONMEBOL');
    const firstUefa = uefaTeams[0];
    const secondUefa = uefaTeams.find((team) => team.pot !== firstUefa.pot)!;
    const thirdUefa = uefaTeams.find((team) => team.pot !== firstUefa.pot && team.pot !== secondUefa.pot)!;
    const firstConmebol = conmebolTeams[0];
    const secondConmebol = conmebolTeams.find((team) => team.pot !== firstConmebol.pot)!;

    expect(canPlaceTeamInGroup([firstUefa], secondUefa)).toBe(true);
    expect(canPlaceTeamInGroup([firstUefa, secondUefa], thirdUefa)).toBe(false);
    expect(canPlaceTeamInGroup([firstConmebol], secondConmebol)).toBe(false);
  });
});
