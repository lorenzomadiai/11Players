import { squads } from '../data/mockData';
import type { GameDraw } from '../types/game';
import { randomItem } from '../utils/random';
import { getAvailableChallenges } from './challenges';
import { formations } from './formations';

export const createRandomDraw = (): GameDraw => {
  const squad = randomItem(squads);
  const availableChallenges = getAvailableChallenges(squad);

  return {
    squadId: squad.id,
    formationId: randomItem(formations).id,
    challengeId: randomItem(availableChallenges).id,
  };
};
