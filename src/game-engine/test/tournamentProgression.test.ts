import { describe, expect, it } from 'vitest';
import { requireSquad } from '../../test/fixtures';
import { buildOpponentXI } from '../opponent';
import { createTournament } from '../tournament';
import { simulateTournament } from '../tournamentProgression';

const dreamTeam = () => {
  const squad = requireSquad('bra-2002');
  const xi = buildOpponentXI(squad);

  return {
    id: 'dream-xi',
    name: 'Dream XI',
    formation: xi.formation,
    lineup: xi.lineup,
    evaluation: xi.evaluation,
    style: 'balanced' as const,
  };
};

describe('tournament progression', () => {
  it('simulates a deterministic full tournament from groups to champion', () => {
    const tournament = createTournament({ seed: 'full-run', userTeamStrength: 86 });
    const first = simulateTournament({ tournament, dreamTeam: dreamTeam() });
    const second = simulateTournament({ tournament, dreamTeam: dreamTeam() });

    expect(first).toEqual(second);
    expect(first.tournament.groupMatches).toHaveLength(48);
    expect(first.tournament.knockoutMatches).toHaveLength(15);
    expect(first.championTeamId).toBeTruthy();
    expect(first.runnerUpTeamId).toBeTruthy();
    expect(first.championTeamId).not.toBe(first.runnerUpTeamId);
    expect(first.teamStats[first.championTeamId].stageReached).toBe('champion');
    expect(first.teamStats[first.runnerUpTeamId].stageReached).toBe('final');
  });

  it('calculates group standings and advances two teams from each group', () => {
    const result = simulateTournament({
      tournament: createTournament({ seed: 'group-table-check', userTeamStrength: 84 }),
      dreamTeam: dreamTeam(),
    });

    Object.values(result.groupStandings).forEach((standings) => {
      expect(standings).toHaveLength(4);
      standings.forEach((standing) => {
        expect(standing.played).toBe(3);
        expect(standing.goalDifference).toBe(standing.goalsFor - standing.goalsAgainst);
      });
    });

    const roundOf16TeamIds = new Set(
      result.tournament.knockoutMatches
        .filter((match) => match.roundId === 'round-of-16')
        .flatMap((match) => [match.homeTeamId, match.awayTeamId]),
    );

    expect(roundOf16TeamIds.size).toBe(16);
  });

  it('aggregates team xG and player xG/xA-style creator credit', () => {
    const result = simulateTournament({
      tournament: createTournament({ seed: 'stats-check', userTeamStrength: 87 }),
      dreamTeam: dreamTeam(),
    });
    const teamStats = Object.values(result.teamStats);
    const teamWithPlayerMetrics = teamStats.find(
      (stats) => Object.keys(stats.playerXg).length > 0 && Object.keys(stats.playerXa).length > 0,
    );

    expect(teamStats).toHaveLength(32);
    expect(teamStats.some((stats) => stats.xgFor > 0 && stats.xgAgainst > 0)).toBe(true);
    expect(teamWithPlayerMetrics).toBeDefined();
  });
});
