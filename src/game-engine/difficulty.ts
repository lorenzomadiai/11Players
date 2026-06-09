import type { Difficulty, DifficultyId } from '../types/game';

export const difficulties: Difficulty[] = [
  {
    id: 'casual',
    label: 'Casual',
    description: 'Generous judging, lighter opponents, and room for a few wild picks.',
    opponentStrength: 73,
    randomness: 9,
    mismatchMultiplier: 0.7,
  },
  {
    id: 'classic',
    label: 'Classic',
    description: 'A proper knockout match: stars matter, but shape and chemistry matter too.',
    opponentStrength: 80,
    randomness: 12,
    mismatchMultiplier: 1,
  },
  {
    id: 'expert',
    label: 'Expert',
    description: 'Every awkward role hurts and the opponent punishes messy lineups.',
    opponentStrength: 86,
    randomness: 15,
    mismatchMultiplier: 1.25,
  },
];

export const getDifficultyById = (id: DifficultyId) =>
  difficulties.find((difficulty) => difficulty.id === id) ?? difficulties[1];
