import type { Position, RoleGroup } from '../types/game';

const positionGroups: Record<Position, RoleGroup> = {
  GK: 'goalkeeper',
  LB: 'defense',
  CB: 'defense',
  RB: 'defense',
  LWB: 'defense',
  RWB: 'defense',
  DM: 'midfield',
  CM: 'midfield',
  AM: 'midfield',
  LM: 'midfield',
  RM: 'midfield',
  LW: 'attack',
  RW: 'attack',
  ST: 'attack',
};

export const getPositionGroup = (position: Position): RoleGroup => positionGroups[position];

export const formatPositions = (positions: Position[]) => positions.join(' / ');

export const isDefensiveProfile = (positions: Position[]) =>
  positions.some((position) => ['GK', 'LB', 'CB', 'RB', 'LWB', 'RWB', 'DM'].includes(position));

export const isWideProfile = (positions: Position[]) =>
  positions.some((position) => ['LB', 'RB', 'LWB', 'RWB', 'LM', 'RM', 'LW', 'RW'].includes(position));

export const isCentralProfile = (positions: Position[]) =>
  positions.some((position) => ['CB', 'DM', 'CM', 'AM', 'ST', 'GK'].includes(position));
