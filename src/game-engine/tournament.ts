import { squads } from '../data/mockData';
import type { Confederation, Squad, TournamentGroup, TournamentMatch, TournamentState, TournamentTeam } from '../types/game';
import type { RandomSource } from '../utils/random';
import { createSeededRng, randomInt, shuffleWithRng } from '../utils/seededRandom';

const GROUP_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const GROUP_SIZE = 4;
const POT_SIZE = 8;

interface CreateTournamentOptions {
  seed: string;
  userTeamName?: string;
  userTeamStrength?: number;
  rng?: RandomSource;
}

const toHistoricalTeam = (squad: Squad): Omit<TournamentTeam, 'pot'> => ({
  id: squad.id,
  kind: 'historical',
  name: `${squad.country} ${squad.year}`,
  countryCode: squad.countryCode,
  confederation: squad.confederation,
  year: squad.year,
  squadId: squad.id,
  seedStrength: squad.baseStrength,
});

const createDreamTeam = (
  replacedSquad: Squad,
  userTeamName: string,
  userTeamStrength: number,
): Omit<TournamentTeam, 'pot'> => ({
  id: 'dream-xi',
  kind: 'dream-xi',
  name: userTeamName,
  countryCode: 'DRM',
  confederation: replacedSquad.confederation,
  replacedSquadId: replacedSquad.id,
  seedStrength: userTeamStrength,
});

const createTournamentField = (
  historicalSquads: Squad[],
  rng: RandomSource,
  userTeamName: string,
  userTeamStrength: number,
) => {
  const replacedSquad = historicalSquads[randomInt(rng, historicalSquads.length)];
  const teams = historicalSquads
    .filter((squad) => squad.id !== replacedSquad.id)
    .map(toHistoricalTeam)
    .concat(createDreamTeam(replacedSquad, userTeamName, userTeamStrength));

  return { teams, replacedSquad };
};

const assignPots = (teams: Omit<TournamentTeam, 'pot'>[]): TournamentTeam[] =>
  [...teams]
    .sort((left, right) => {
      if (right.seedStrength !== left.seedStrength) {
        return right.seedStrength - left.seedStrength;
      }

      return left.name.localeCompare(right.name);
    })
    .map((team, index) => ({
      ...team,
      pot: Math.floor(index / POT_SIZE) + 1,
    }));

export const canPlaceTeamInGroup = (groupTeams: TournamentTeam[], candidate: TournamentTeam) => {
  if (groupTeams.some((team) => team.pot === candidate.pot)) {
    return false;
  }

  const confederationCounts = groupTeams.reduce<Record<Confederation, number>>(
    (counts, team) => ({
      ...counts,
      [team.confederation]: (counts[team.confederation] ?? 0) + 1,
    }),
    {} as Record<Confederation, number>,
  );
  const currentCount = confederationCounts[candidate.confederation] ?? 0;

  return candidate.confederation === 'UEFA' ? currentCount < 2 : currentCount === 0;
};

const findGroupAssignment = (
  potTeams: TournamentTeam[],
  groups: TournamentGroup[],
  rng: RandomSource,
): TournamentGroup[] | null => {
  const orderedTeams = shuffleWithRng(potTeams, rng);

  const assignTeam = (teamIndex: number, currentGroups: TournamentGroup[]): TournamentGroup[] | null => {
    if (teamIndex >= orderedTeams.length) {
      return currentGroups;
    }

    const team = orderedTeams[teamIndex];
    const candidateGroupIndexes = shuffleWithRng(
      currentGroups
        .map((group, index) => ({ group, index }))
        .filter(({ group }) => group.teams.length < GROUP_SIZE && canPlaceTeamInGroup(group.teams, team))
        .map(({ index }) => index),
      rng,
    );

    for (const groupIndex of candidateGroupIndexes) {
      const nextGroups = currentGroups.map((group, index) =>
        index === groupIndex ? { ...group, teams: [...group.teams, team] } : group,
      );
      const result = assignTeam(teamIndex + 1, nextGroups);

      if (result) {
        return result;
      }
    }

    return null;
  };

  return assignTeam(0, groups);
};

export const drawTournamentGroups = (teams: TournamentTeam[], rng: RandomSource): TournamentGroup[] => {
  const pots = [1, 2, 3, 4].map((pot) => teams.filter((team) => team.pot === pot));

  if (teams.length !== 32 || pots.some((pot) => pot.length !== POT_SIZE)) {
    throw new Error('Tournament draw requires exactly 32 teams split across four pots of eight.');
  }

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const initialGroups = GROUP_LABELS.map<TournamentGroup>((label) => ({
      id: `group-${label.toLowerCase()}`,
      label,
      teams: [],
    }));

    const groups = pots.reduce<TournamentGroup[] | null>((currentGroups, potTeams) => {
      if (!currentGroups) {
        return null;
      }

      return findGroupAssignment(potTeams, currentGroups, rng);
    }, initialGroups);

    if (groups) {
      return groups;
    }
  }

  throw new Error('Unable to create a valid group draw with confederation constraints.');
};

export const createGroupMatches = (groups: TournamentGroup[]): TournamentMatch[] =>
  groups.flatMap((group) => {
    const [first, second, third, fourth] = group.teams;
    const pairings = [
      ['group-1', first, second],
      ['group-1', third, fourth],
      ['group-2', first, third],
      ['group-2', second, fourth],
      ['group-3', first, fourth],
      ['group-3', second, third],
    ] as const;

    return pairings.map(([roundId, home, away], index) => ({
      id: `${group.id}-match-${index + 1}`,
      roundId,
      groupId: group.id,
      homeTeamId: home.id,
      awayTeamId: away.id,
    }));
  });

export const createTournament = ({
  seed,
  userTeamName = 'Dream XI',
  userTeamStrength = 84,
  rng = createSeededRng(seed),
}: CreateTournamentOptions): TournamentState => {
  const { teams, replacedSquad } = createTournamentField(squads, rng, userTeamName, userTeamStrength);
  const seededTeams = assignPots(teams);
  const groups = drawTournamentGroups(seededTeams, rng);

  return {
    id: `tournament-${seed}`,
    seed,
    teams: seededTeams,
    groups,
    groupMatches: createGroupMatches(groups),
    knockoutMatches: [],
    userTeamId: 'dream-xi',
    replacedSquadId: replacedSquad.id,
  };
};
