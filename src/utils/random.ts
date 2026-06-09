export const randomItem = <T>(items: T[]): T => {
  if (items.length === 0) {
    throw new Error('Cannot pick a random item from an empty array.');
  }

  return items[Math.floor(Math.random() * items.length)];
};

export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const round = (value: number, digits = 0) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
