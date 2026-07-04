import type { RandomSource } from './random';

const hashSeed = (seed: string) => {
  let hash = 1779033703 ^ seed.length;

  for (let index = 0; index < seed.length; index += 1) {
    hash = Math.imul(hash ^ seed.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }

  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
};

export const createSeededRng = (seed: string): RandomSource => {
  const nextSeed = hashSeed(seed);
  let value = nextSeed();

  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomInt = (rng: RandomSource, maxExclusive: number) => Math.floor(rng() * maxExclusive);

export const shuffleWithRng = <T>(items: T[], rng: RandomSource) => {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(rng, index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};
