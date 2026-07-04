import { getSquadById } from '../data/mockData';
import type {
  GroupStanding,
  TacticalMatchEvent,
  TacticalMatchResult,
  TacticalTeamInput,
  TournamentMatch,
  TournamentRoundId,
  TournamentSimulationResult,
  TournamentStageReached,
  TournamentState,
  TournamentTeam,
  TournamentTeamStats,
} from '../types/game';
import { round } from '../utils/random';
import { createSeededRng } from '../utils/seededRandom';
import { buildOpponentXI } from './opponent';
import { simulateTacticalMatch } from './tacticalMatch';

const knockoutRoundOrder: TournamentRoundId[] = ['round-of-16', 'quarter-final', 'semi-final', 'final'];

interface SimulateTournamentOptions {
  tournament: TournamentState;
  dreamTeam: TacticalTeamInput;
}

const stageRank: Record<TournamentStageReached, number> = {
  group: 0,
  'round-of-16': 1,
  'quarter-final': 2,
  'semi-final': 3,
  final: 4,
  champion: 5,
};

const betterStage = (current: TournamentStageReached, next: TournamentStageReached) =>
  stageRank[next] > stageRank[current] ? next : current;

const emptyStanding = (teamId: string): GroupStanding => ({
  teamId,
  played: 0,
  points: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
});

const emptyTeamStats = (teamId: string): TournamentTeamStats => ({
  teamId,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  goalDifference: 0,
  xgFor: 0,
  xgAgainst: 0,
  playerXg: {},
  playerXa: {},
  stageReached: 'group',
});

const addPlayerMetric = (metrics: Record<string, number>, playerId: string | undefined, value: number) => {
  if (!playerId) {
    return;
  }

  metrics[playerId] = round((metrics[playerId] ?? 0) + value, 2);
};

const addEventMetrics = (stats: TournamentTeamStats, events: TacticalMatchEvent[], side: 'home' | 'away') => {
  events
    .filter((event) => event.side === side)
    .forEach((event) => {
      addPlayerMetric(stats.playerXg, event.shooterId, event.xg);
      addPlayerMetric(stats.playerXa, event.creatorId, event.xg);
    });
};

export const buildTournamentTeamInput = (
  team: TournamentTeam,
  dreamTeam: TacticalTeamInput,
): TacticalTeamInput => {
  if (team.kind === 'dream-xi') {
    return {
      ...dreamTeam,
      id: team.id,
      name: team.name,
    };
  }

  if (!team.squadId) {
    throw new Error(`Historical tournament team is missing a squad id: ${team.id}`);
  }

  const squad = getSquadById(team.squadId);
  if (!squad) {
    throw new Error(`Missing tournament squad: ${team.squadId}`);
  }

  const opponent = buildOpponentXI(squad);

  return {
    id: team.id,
    name: team.name,
    formation: opponent.formation,
    lineup: opponent.lineup,
    evaluation: opponent.evaluation,
    style: 'balanced',
  };
};

const matchWinnerId = (match: TournamentMatch) => {
  if (!match.result?.winnerSide) {
    throw new Error(`Knockout match did not produce a winner: ${match.id}`);
  }

  return match.result.winnerSide === 'home' ? match.homeTeamId : match.awayTeamId;
};

const simulateMatch = (
  tournament: TournamentState,
  teamsById: Record<string, TournamentTeam>,
  dreamTeam: TacticalTeamInput,
  match: TournamentMatch,
  knockout = false,
): TournamentMatch => {
  const homeTeam = teamsById[match.homeTeamId];
  const awayTeam = teamsById[match.awayTeamId];

  if (!homeTeam || !awayTeam) {
    throw new Error(`Tournament match has missing teams: ${match.id}`);
  }

  return {
    ...match,
    result: simulateTacticalMatch(
      buildTournamentTeamInput(homeTeam, dreamTeam),
      buildTournamentTeamInput(awayTeam, dreamTeam),
      {
        knockout,
        rng: createSeededRng(`${tournament.seed}:${match.id}`),
      },
    ),
  };
};

export const calculateGroupStandings = (
  tournament: TournamentState,
  groupMatches: TournamentMatch[],
): Record<string, GroupStanding[]> => {
  const teamsById = Object.fromEntries(tournament.teams.map((team) => [team.id, team]));

  return Object.fromEntries(
    tournament.groups.map((group) => {
      const standings = Object.fromEntries(group.teams.map((team) => [team.id, emptyStanding(team.id)]));

      groupMatches
        .filter((match) => match.groupId === group.id)
        .forEach((match) => {
          if (!match.result) {
            return;
          }

          const home = standings[match.homeTeamId];
          const away = standings[match.awayTeamId];
          home.played += 1;
          away.played += 1;
          home.goalsFor += match.result.homeGoals;
          home.goalsAgainst += match.result.awayGoals;
          away.goalsFor += match.result.awayGoals;
          away.goalsAgainst += match.result.homeGoals;

          if (match.result.homeGoals > match.result.awayGoals) {
            home.wins += 1;
            away.losses += 1;
            home.points += 3;
          } else if (match.result.awayGoals > match.result.homeGoals) {
            away.wins += 1;
            home.losses += 1;
            away.points += 3;
          } else {
            home.draws += 1;
            away.draws += 1;
            home.points += 1;
            away.points += 1;
          }

          home.goalDifference = home.goalsFor - home.goalsAgainst;
          away.goalDifference = away.goalsFor - away.goalsAgainst;
        });

      const sorted = Object.values(standings).sort((left, right) => {
        if (right.points !== left.points) return right.points - left.points;
        if (right.goalDifference !== left.goalDifference) return right.goalDifference - left.goalDifference;
        if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor;
        if (teamsById[right.teamId].seedStrength !== teamsById[left.teamId].seedStrength) {
          return teamsById[right.teamId].seedStrength - teamsById[left.teamId].seedStrength;
        }

        return teamsById[left.teamId].name.localeCompare(teamsById[right.teamId].name);
      });

      return [group.id, sorted];
    }),
  );
};

const roundOf16Pairings = (groupStandings: Record<string, GroupStanding[]>): TournamentMatch[] => {
  const winner = (groupLabel: string) => groupStandings[`group-${groupLabel}`][0].teamId;
  const runnerUp = (groupLabel: string) => groupStandings[`group-${groupLabel}`][1].teamId;
  const pairings = [
    [winner('a'), runnerUp('b')],
    [winner('c'), runnerUp('d')],
    [winner('e'), runnerUp('f')],
    [winner('g'), runnerUp('h')],
    [winner('b'), runnerUp('a')],
    [winner('d'), runnerUp('c')],
    [winner('f'), runnerUp('e')],
    [winner('h'), runnerUp('g')],
  ];

  return pairings.map(([homeTeamId, awayTeamId], index) => ({
    id: `round-of-16-match-${index + 1}`,
    roundId: 'round-of-16',
    homeTeamId,
    awayTeamId,
  }));
};

const nextRoundMatches = (roundId: TournamentRoundId, previousMatches: TournamentMatch[]): TournamentMatch[] => {
  const winners = previousMatches.map(matchWinnerId);

  return Array.from({ length: winners.length / 2 }, (_, index) => ({
    id: `${roundId}-match-${index + 1}`,
    roundId,
    homeTeamId: winners[index * 2],
    awayTeamId: winners[index * 2 + 1],
  }));
};

const applyTeamMatchStats = (
  teamStats: Record<string, TournamentTeamStats>,
  match: TournamentMatch,
  stage: TournamentStageReached,
) => {
  if (!match.result) {
    return;
  }

  const home = teamStats[match.homeTeamId];
  const away = teamStats[match.awayTeamId];
  home.played += 1;
  away.played += 1;
  home.goalsFor += match.result.homeGoals;
  home.goalsAgainst += match.result.awayGoals;
  away.goalsFor += match.result.awayGoals;
  away.goalsAgainst += match.result.homeGoals;
  home.goalDifference = home.goalsFor - home.goalsAgainst;
  away.goalDifference = away.goalsFor - away.goalsAgainst;
  home.xgFor = round(home.xgFor + match.result.homeXg, 2);
  home.xgAgainst = round(home.xgAgainst + match.result.awayXg, 2);
  away.xgFor = round(away.xgFor + match.result.awayXg, 2);
  away.xgAgainst = round(away.xgAgainst + match.result.homeXg, 2);
  home.stageReached = betterStage(home.stageReached, stage);
  away.stageReached = betterStage(away.stageReached, stage);
  addEventMetrics(home, match.result.events, 'home');
  addEventMetrics(away, match.result.events, 'away');

  const winnerId =
    match.result.outcome === 'home-win'
      ? match.homeTeamId
      : match.result.outcome === 'away-win'
        ? match.awayTeamId
        : match.result.winnerSide === 'home'
          ? match.homeTeamId
          : match.result.winnerSide === 'away'
            ? match.awayTeamId
            : null;

  if (winnerId === match.homeTeamId) {
    home.wins += 1;
    away.losses += 1;
  } else if (winnerId === match.awayTeamId) {
    away.wins += 1;
    home.losses += 1;
  } else {
    home.draws += 1;
    away.draws += 1;
  }
};

export const simulateTournament = ({
  tournament,
  dreamTeam,
}: SimulateTournamentOptions): TournamentSimulationResult => {
  const teamsById = Object.fromEntries(tournament.teams.map((team) => [team.id, team]));
  const teamStats = Object.fromEntries(tournament.teams.map((team) => [team.id, emptyTeamStats(team.id)]));
  const groupMatches = tournament.groupMatches.map((match) => simulateMatch(tournament, teamsById, dreamTeam, match));

  groupMatches.forEach((match) => applyTeamMatchStats(teamStats, match, 'group'));

  const groupStandings = calculateGroupStandings(tournament, groupMatches);
  let currentRound = roundOf16Pairings(groupStandings);
  let knockoutMatches: TournamentMatch[] = [];

  knockoutRoundOrder.forEach((roundId, roundIndex) => {
    if (roundIndex > 0) {
      currentRound = nextRoundMatches(roundId, knockoutMatches.slice(-currentRound.length));
    }

    const stage = roundId === 'round-of-16' ? 'round-of-16' : roundId === 'quarter-final' ? 'quarter-final' : roundId === 'semi-final' ? 'semi-final' : 'final';
    const simulatedRound = currentRound.map((match) => simulateMatch(tournament, teamsById, dreamTeam, match, true));
    simulatedRound.forEach((match) => applyTeamMatchStats(teamStats, match, stage));
    knockoutMatches = [...knockoutMatches, ...simulatedRound];
    currentRound = simulatedRound;
  });

  const finalMatch = knockoutMatches[knockoutMatches.length - 1];
  const championTeamId = matchWinnerId(finalMatch);
  const runnerUpTeamId = championTeamId === finalMatch.homeTeamId ? finalMatch.awayTeamId : finalMatch.homeTeamId;
  teamStats[championTeamId].stageReached = 'champion';

  return {
    tournament: {
      ...tournament,
      groupMatches,
      knockoutMatches,
    },
    groupStandings,
    teamStats,
    championTeamId,
    runnerUpTeamId,
  };
};
