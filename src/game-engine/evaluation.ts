import type {
  Achievement,
  ChallengeReport,
  Difficulty,
  Formation,
  FormationSlot,
  LineupSelection,
  Player,
  SlotReport,
  TeamEvaluation,
} from '../types/game';
import { clamp, round } from '../utils/random';
import { getChallengeById } from './challenges';
import { getPositionGroup, isCentralProfile, isWideProfile } from './positions';

const average = (values: number[], fallback = 0) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : fallback;

export const getSelectedPlayers = (formation: Formation, lineup: LineupSelection) =>
  formation.slots.map((slot) => lineup[slot.id]).filter((player): player is Player => Boolean(player));

const getDuplicatePlayerIds = (lineup: LineupSelection) => {
  const counts = Object.values(lineup).reduce<Record<string, number>>((acc, player) => {
    if (player) {
      acc[player.id] = (acc[player.id] ?? 0) + 1;
    }
    return acc;
  }, {});

  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([playerId]) => playerId);
};

export const getPlayerSlotFit = (slot: FormationSlot, player: Player) => {
  const exactPositionIndex = player.positions.findIndex((position) => slot.acceptedPositions.includes(position));
  if (exactPositionIndex === 0) {
    return { compatibility: 1, message: 'Natural role fit' };
  }

  if (exactPositionIndex > 0) {
    return { compatibility: 0.9, message: 'Comfortable secondary role' };
  }

  const sameLine = player.positions.some((position) => getPositionGroup(position) === slot.roleGroup);
  if (sameLine) {
    return { compatibility: 0.64, message: 'Same line, awkward detail' };
  }

  if (slot.roleGroup === 'midfield' && (isCentralProfile(player.positions) || isWideProfile(player.positions))) {
    return { compatibility: 0.52, message: 'Emergency tactical compromise' };
  }

  return { compatibility: 0.28, message: 'Tactical mismatch' };
};

const buildSlotReports = (formation: Formation, lineup: LineupSelection): SlotReport[] =>
  formation.slots.map((slot) => {
    const player = lineup[slot.id];

    if (!player) {
      return {
        slotId: slot.id,
        slotLabel: slot.label,
        compatibility: 0,
        message: 'Empty slot',
      };
    }

    const fit = getPlayerSlotFit(slot, player);

    return {
      slotId: slot.id,
      slotLabel: slot.label,
      playerId: player.id,
      playerName: player.name,
      ...fit,
    };
  });

const lineScore = (slot: FormationSlot, player: Player, compatibility: number) => {
  if (slot.roleGroup === 'goalkeeper' || slot.roleGroup === 'defense') {
    return (player.rating * 0.32 + player.stats.defense * 0.45 + player.stats.physical * 0.23) * compatibility;
  }

  if (slot.roleGroup === 'midfield') {
    return (
      player.rating * 0.25 +
      player.stats.passing * 0.34 +
      player.stats.technique * 0.23 +
      player.stats.defense * 0.18
    ) * compatibility;
  }

  return (
    player.rating * 0.25 +
    player.stats.shooting * 0.34 +
    player.stats.technique * 0.23 +
    player.stats.pace * 0.18
  ) * compatibility;
};

const countSameClubPairs = (players: Player[]) => {
  const clubCounts = players.reduce<Record<string, number>>((counts, player) => {
    counts[player.club] = (counts[player.club] ?? 0) + 1;
    return counts;
  }, {});

  return Object.values(clubCounts).reduce((pairs, count) => pairs + (count > 1 ? (count * (count - 1)) / 2 : 0), 0);
};

const evaluateChallenge = (challengeId: string, players: Player[]): ChallengeReport =>
  getChallengeById(challengeId).evaluate(players);

const shapeBonus = (formation: Formation, lineup: LineupSelection) => {
  let score = 0;

  formation.slots.forEach((slot) => {
    const player = lineup[slot.id];
    if (!player) {
      return;
    }

    const isWideSlot = slot.x < 25 || slot.x > 75;
    const isCentralSlot = slot.x >= 35 && slot.x <= 65;

    if (formation.shapeBias === 'wide' && isWideSlot) {
      score += isWideProfile(player.positions) ? 1.4 : -2.2;
    }

    if (formation.shapeBias === 'compact' && isCentralSlot) {
      score += isCentralProfile(player.positions) ? 1.2 : -1.6;
    }

    if (formation.shapeBias === 'front-foot' && slot.y < 40) {
      score += player.stats.technique > 83 || player.stats.shooting > 83 ? 1.3 : -1.4;
    }
  });

  return score;
};

const buildWarnings = (
  selectedPlayers: Player[],
  evaluation: Pick<TeamEvaluation, 'isComplete' | 'duplicatePlayerIds' | 'slotReports' | 'challenge'>,
) => {
  const warnings: string[] = [];

  if (!evaluation.isComplete) {
    warnings.push('Fill all 11 positions before simulating the match.');
  }

  if (evaluation.duplicatePlayerIds.length > 0) {
    const duplicateNames = evaluation.duplicatePlayerIds
      .map((id) => selectedPlayers.find((player) => player.id === id)?.name ?? id)
      .join(', ');
    warnings.push(`Duplicate player detected: ${duplicateNames}.`);
  }

  evaluation.slotReports
    .filter((report) => report.playerId && report.compatibility < 0.6)
    .forEach((report) => {
      warnings.push(`${report.playerName} at ${report.slotLabel}: ${report.message.toLowerCase()}.`);
    });

  if (!evaluation.challenge.passed && evaluation.isComplete) {
    warnings.push(`Challenge penalty active: ${evaluation.challenge.label}.`);
  }

  return warnings;
};

const buildAchievements = (
  players: Player[],
  slotReports: SlotReport[],
  challenge: ChallengeReport,
  attack: number,
  midfield: number,
  defense: number,
): Achievement[] => {
  const legendCount = players.filter((player) => player.isLegend).length;
  const clubPairs = countSameClubPairs(players);
  const spread = Math.max(attack, midfield, defense) - Math.min(attack, midfield, defense);
  const complete = players.length === 11;

  return [
    {
      id: 'perfect-fit',
      label: 'Perfect Fit',
      description: 'Every starter is playing a natural or comfortable secondary position.',
      earned: complete && slotReports.every((report) => report.compatibility >= 0.9),
    },
    {
      id: 'legend-stack',
      label: 'Legend Boost',
      description: 'At least three iconic players are powering the XI.',
      earned: complete && legendCount >= 3,
    },
    {
      id: 'club-chemistry',
      label: 'Club Chemistry',
      description: 'Multiple club partnerships add instant understanding.',
      earned: complete && clubPairs >= 3,
    },
    {
      id: 'balanced-machine',
      label: 'Balanced Machine',
      description: 'Attack, midfield, and defense are within eight points of each other.',
      earned: complete && spread <= 8,
    },
    {
      id: 'challenge-clear',
      label: 'Challenge Clear',
      description: 'The random challenge was satisfied.',
      earned: complete && challenge.passed,
    },
  ];
};

export const evaluateLineup = (
  formation: Formation,
  lineup: LineupSelection,
  difficulty: Difficulty,
  challengeId: string,
): TeamEvaluation => {
  const slotReports = buildSlotReports(formation, lineup);
  const selectedPlayers = getSelectedPlayers(formation, lineup);
  const duplicatePlayerIds = getDuplicatePlayerIds(lineup);
  const isComplete = selectedPlayers.length === 11 && duplicatePlayerIds.length === 0;
  const filledSlots = selectedPlayers.length;
  const challenge = evaluateChallenge(challengeId, selectedPlayers);
  const reportsBySlot = Object.fromEntries(slotReports.map((report) => [report.slotId, report]));

  const defenseScores: number[] = [];
  const midfieldScores: number[] = [];
  const attackScores: number[] = [];

  formation.slots.forEach((slot) => {
    const player = lineup[slot.id];
    if (!player) {
      return;
    }

    const score = lineScore(slot, player, reportsBySlot[slot.id].compatibility);
    if (slot.roleGroup === 'goalkeeper' || slot.roleGroup === 'defense') {
      defenseScores.push(score);
    } else if (slot.roleGroup === 'midfield') {
      midfieldScores.push(score);
    } else {
      attackScores.push(score);
    }
  });

  const attack = clamp(round(average(attackScores), 1));
  const midfield = clamp(round(average(midfieldScores), 1));
  const defense = clamp(round(average(defenseScores), 1));
  const averageCompatibility = average(
    slotReports.filter((report) => report.playerId).map((report) => report.compatibility),
    0,
  );
  const sameClubBonus = clamp(countSameClubPairs(selectedPlayers) * 1.35, 0, 12);
  const sameEraBonus = new Set(selectedPlayers.map((player) => player.eraGroup)).size <= 1 && selectedPlayers.length > 4 ? 7 : 0;
  const leadershipBonus = selectedPlayers.some((player) => player.traits.includes('Leadership')) ? 3 : 0;
  const duplicatePenalty = duplicatePlayerIds.length * 12;
  const mismatchPenalty =
    slotReports.reduce((total, report) => total + (report.playerId ? 1 - report.compatibility : 0), 0) *
    difficulty.mismatchMultiplier *
    6;

  const chemistry = clamp(
    round(34 + averageCompatibility * 27 + sameClubBonus + sameEraBonus + leadershipBonus - duplicatePenalty - challenge.penalty * 0.35, 1),
  );
  const tacticalFit = clamp(
    round(averageCompatibility * 82 + shapeBonus(formation, lineup) - mismatchPenalty - challenge.penalty * 0.3, 1),
  );
  const legendBoost = selectedPlayers.filter((player) => player.isLegend).length * 3.2;
  const starPower = clamp(round(average(selectedPlayers.map((player) => player.rating), 0) * 0.74 + legendBoost, 1));
  const overall = clamp(
    round(
      attack * 0.22 +
        midfield * 0.2 +
        defense * 0.2 +
        chemistry * 0.16 +
        tacticalFit * 0.14 +
        starPower * 0.08 -
        duplicatePenalty * 0.3 -
        challenge.penalty * 0.25,
      1,
    ),
  );

  const partialEvaluation = { isComplete, duplicatePlayerIds, slotReports, challenge };
  const achievements = buildAchievements(selectedPlayers, slotReports, challenge, attack, midfield, defense);

  return {
    filledSlots,
    isComplete,
    duplicatePlayerIds,
    slotReports,
    chemistry,
    tacticalFit,
    attack,
    midfield,
    defense,
    starPower,
    overall,
    challenge,
    warnings: buildWarnings(selectedPlayers, partialEvaluation),
    achievements,
  };
};
