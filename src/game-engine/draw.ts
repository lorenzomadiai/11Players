import { squads } from '../data/mockData';
import type { GameDraw } from '../types/game';
import { randomItem, type RandomSource } from '../utils/random';
import { getAvailableChallenges } from './challenges';
import { formations } from './formations';

export const createRandomDraw = (rng: RandomSource = Math.random): GameDraw => {
  const squad = randomItem(squads, rng);
  const availableChallenges = getAvailableChallenges(squad);

  return {
    squadId: squad.id,
    formationId: randomItem(formations, rng).id,
    challengeId: randomItem(availableChallenges, rng).id,
  };
};
