import type { BasePlayerStats, PlayerStats, Position } from '../types/game';

interface PlayerStatContext {
  rating: number;
  positions: Position[];
  traits?: string[];
}

const clampStat = (value: number) => Math.max(1, Math.min(99, Math.round(value)));

const hasPosition = (positions: Position[], targets: Position[]) => positions.some((position) => targets.includes(position));

const traitBonus = (traits: string[] = [], keywords: string[], amount: number) =>
  traits.some((trait) => keywords.some((keyword) => trait.toLowerCase().includes(keyword.toLowerCase()))) ? amount : 0;

export const completePlayerStats = (base: BasePlayerStats, context: PlayerStatContext): PlayerStats => {
  const positions = context.positions;
  const traits = context.traits ?? [];
  const isKeeper = hasPosition(positions, ['GK']);
  const isCenterBack = hasPosition(positions, ['CB']);
  const isFullBack = hasPosition(positions, ['LB', 'RB', 'LWB', 'RWB']);
  const isMidfielder = hasPosition(positions, ['DM', 'CM', 'AM', 'LM', 'RM']);
  const isCreator = hasPosition(positions, ['CM', 'AM', 'LM', 'RM', 'LW', 'RW']);
  const isForward = hasPosition(positions, ['ST', 'LW', 'RW']);

  const finishing =
    base.shooting * 0.56 +
    base.technique * 0.18 +
    context.rating * 0.26 +
    (hasPosition(positions, ['ST']) ? 5 : isForward ? 3 : isMidfielder ? -1 : -5) +
    traitBonus(traits, ['finish', 'shot', 'goal', 'striker', 'scorer'], 3);

  const chanceCreation =
    base.passing * 0.44 +
    base.technique * 0.34 +
    context.rating * 0.22 +
    (isCreator ? 4 : isFullBack ? 1 : isKeeper || isCenterBack ? -5 : 0) +
    traitBonus(traits, ['create', 'assist', 'pass', 'tempo', 'delivery', 'playmaker', 'diagonal'], 3);

  const setPieces =
    base.passing * 0.42 +
    base.technique * 0.32 +
    base.shooting * 0.18 +
    context.rating * 0.08 +
    traitBonus(traits, ['set-piece', 'free kick', 'corner', 'delivery', 'long shot'], 5);

  const aerial =
    base.physical * 0.38 +
    base.defense * 0.24 +
    context.rating * 0.18 +
    base.shooting * 0.08 +
    base.technique * 0.12 +
    (isCenterBack ? 7 : hasPosition(positions, ['ST', 'GK']) ? 5 : isFullBack ? 1 : -1) +
    traitBonus(traits, ['aerial', 'header', 'commanding', 'target'], 4);

  const goalkeeping = isKeeper
    ? base.defense * 0.58 +
      base.physical * 0.18 +
      base.passing * 0.1 +
      context.rating * 0.14 +
      traitBonus(traits, ['shot', 'keeper', 'reflex', 'penalty', 'commanding'], 4)
    : 1 + base.defense * 0.05 + base.physical * 0.03;

  const workRate =
    base.physical * 0.34 +
    base.pace * 0.2 +
    base.defense * 0.18 +
    context.rating * 0.2 +
    base.passing * 0.08 +
    (isMidfielder || isFullBack ? 3 : 0) +
    traitBonus(traits, ['press', 'engine', 'runner', 'leadership', 'recovery', 'work'], 3);

  return {
    ...base,
    finishing: clampStat(finishing),
    chanceCreation: clampStat(chanceCreation),
    setPieces: clampStat(setPieces),
    aerial: clampStat(aerial),
    goalkeeping: clampStat(goalkeeping),
    workRate: clampStat(workRate),
  };
};
