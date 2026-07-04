import type { Formation, FormationSlot, LineupSelection, OpponentXI, Player, Squad } from '../types/game';
import { getDifficultyById } from './difficulty';
import { evaluateLineup, getPlayerSlotFit } from './evaluation';
import { formations } from './formations';
import { freePlayChallenge } from './challenges';

const slotPriority = (slot: FormationSlot) => {
  if (slot.roleGroup === 'goalkeeper') return 0;
  if (slot.acceptedPositions.length === 1) return 1;
  if (slot.roleGroup === 'defense') return 2;
  if (slot.roleGroup === 'attack') return 3;
  return 4;
};

export const playerSlotScore = (slot: FormationSlot, player: Player) => {
  const fit = getPlayerSlotFit(slot, player).compatibility;

  if (slot.roleGroup === 'goalkeeper') {
    return (
      player.stats.goalkeeping * 0.5 +
      player.stats.defense * 0.18 +
      player.stats.physical * 0.12 +
      player.rating * 0.2
    ) * fit;
  }

  if (slot.roleGroup === 'defense') {
    return (
      player.stats.defense * 0.34 +
      player.stats.aerial * 0.18 +
      player.stats.physical * 0.16 +
      player.stats.workRate * 0.12 +
      player.rating * 0.2
    ) * fit;
  }

  if (slot.roleGroup === 'midfield') {
    return (
      player.stats.passing * 0.22 +
      player.stats.chanceCreation * 0.2 +
      player.stats.technique * 0.18 +
      player.stats.workRate * 0.16 +
      player.stats.defense * 0.08 +
      player.rating * 0.16
    ) * fit;
  }

  return (
    player.stats.finishing * 0.26 +
    player.stats.shooting * 0.2 +
    player.stats.pace * 0.14 +
    player.stats.technique * 0.14 +
    player.stats.aerial * 0.08 +
    player.rating * 0.18
  ) * fit;
};

export const buildOpponentLineup = (squad: Squad, formation: Formation): LineupSelection => {
  const lineup = formation.slots.reduce<LineupSelection>((slots, slot) => ({ ...slots, [slot.id]: null }), {});
  const usedPlayerIds = new Set<string>();
  const orderedSlots = [...formation.slots].sort((left, right) => {
    const priorityDelta = slotPriority(left) - slotPriority(right);

    if (priorityDelta !== 0) {
      return priorityDelta;
    }

    return left.id.localeCompare(right.id);
  });

  orderedSlots.forEach((slot) => {
    const player = squad.players
      .filter((candidate) => !usedPlayerIds.has(candidate.id))
      .map((candidate) => ({ player: candidate, score: playerSlotScore(slot, candidate) }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (right.player.rating !== left.player.rating) {
          return right.player.rating - left.player.rating;
        }

        return left.player.id.localeCompare(right.player.id);
      })[0]?.player;

    if (player) {
      lineup[slot.id] = player;
      usedPlayerIds.add(player.id);
    }
  });

  return lineup;
};

export const buildOpponentXIForFormation = (squad: Squad, formation: Formation): OpponentXI => {
  const difficulty = getDifficultyById('classic');
  const lineup = buildOpponentLineup(squad, formation);
  const evaluation = evaluateLineup(formation, lineup, difficulty, freePlayChallenge.id);

  return {
    squad,
    formation,
    lineup,
    evaluation,
  };
};

export const buildOpponentXI = (squad: Squad): OpponentXI =>
  formations
    .map((formation) => buildOpponentXIForFormation(squad, formation))
    .sort((left, right) => {
      if (right.evaluation.overall !== left.evaluation.overall) {
        return right.evaluation.overall - left.evaluation.overall;
      }

      if (right.evaluation.tacticalFit !== left.evaluation.tacticalFit) {
        return right.evaluation.tacticalFit - left.evaluation.tacticalFit;
      }

      return left.formation.id.localeCompare(right.formation.id);
    })[0];
