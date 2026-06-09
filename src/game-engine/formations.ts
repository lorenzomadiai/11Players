import type { Formation } from '../types/game';

export const formations: Formation[] = [
  {
    id: '433',
    name: '4-3-3',
    nickname: 'Wide Storm',
    description: 'Three forwards stretch the pitch while a holding midfielder protects the back four.',
    shapeBias: 'wide',
    slots: [
      { id: 'gk', label: 'GK', acceptedPositions: ['GK'], roleGroup: 'goalkeeper', x: 50, y: 90 },
      { id: 'lb', label: 'LB', acceptedPositions: ['LB', 'LWB'], roleGroup: 'defense', x: 18, y: 72 },
      { id: 'cb1', label: 'CB', acceptedPositions: ['CB'], roleGroup: 'defense', x: 38, y: 74 },
      { id: 'cb2', label: 'CB', acceptedPositions: ['CB'], roleGroup: 'defense', x: 62, y: 74 },
      { id: 'rb', label: 'RB', acceptedPositions: ['RB', 'RWB'], roleGroup: 'defense', x: 82, y: 72 },
      { id: 'dm', label: 'DM', acceptedPositions: ['DM', 'CM'], roleGroup: 'midfield', x: 50, y: 58 },
      { id: 'cm1', label: 'CM', acceptedPositions: ['CM', 'AM', 'DM'], roleGroup: 'midfield', x: 32, y: 46 },
      { id: 'cm2', label: 'CM', acceptedPositions: ['CM', 'AM', 'DM'], roleGroup: 'midfield', x: 68, y: 46 },
      { id: 'lw', label: 'LW', acceptedPositions: ['LW', 'LM', 'AM'], roleGroup: 'attack', x: 18, y: 24 },
      { id: 'st', label: 'ST', acceptedPositions: ['ST'], roleGroup: 'attack', x: 50, y: 18 },
      { id: 'rw', label: 'RW', acceptedPositions: ['RW', 'RM', 'AM'], roleGroup: 'attack', x: 82, y: 24 },
    ],
  },
  {
    id: '442',
    name: '4-4-2',
    nickname: 'Classic Engine',
    description: 'Balanced lines, paired strikers, and a midfield four that rewards discipline.',
    shapeBias: 'balanced',
    slots: [
      { id: 'gk', label: 'GK', acceptedPositions: ['GK'], roleGroup: 'goalkeeper', x: 50, y: 90 },
      { id: 'lb', label: 'LB', acceptedPositions: ['LB', 'LWB'], roleGroup: 'defense', x: 18, y: 72 },
      { id: 'cb1', label: 'CB', acceptedPositions: ['CB'], roleGroup: 'defense', x: 38, y: 74 },
      { id: 'cb2', label: 'CB', acceptedPositions: ['CB'], roleGroup: 'defense', x: 62, y: 74 },
      { id: 'rb', label: 'RB', acceptedPositions: ['RB', 'RWB'], roleGroup: 'defense', x: 82, y: 72 },
      { id: 'lm', label: 'LM', acceptedPositions: ['LM', 'LW', 'LWB'], roleGroup: 'midfield', x: 18, y: 48 },
      { id: 'cm1', label: 'CM', acceptedPositions: ['CM', 'DM', 'AM'], roleGroup: 'midfield', x: 40, y: 50 },
      { id: 'cm2', label: 'CM', acceptedPositions: ['CM', 'DM', 'AM'], roleGroup: 'midfield', x: 60, y: 50 },
      { id: 'rm', label: 'RM', acceptedPositions: ['RM', 'RW', 'RWB'], roleGroup: 'midfield', x: 82, y: 48 },
      { id: 'st1', label: 'ST', acceptedPositions: ['ST', 'LW'], roleGroup: 'attack', x: 40, y: 20 },
      { id: 'st2', label: 'ST', acceptedPositions: ['ST', 'RW'], roleGroup: 'attack', x: 60, y: 20 },
    ],
  },
  {
    id: '352',
    name: '3-5-2',
    nickname: 'Control Tower',
    description: 'Three center backs and wing backs create overloads, but the flanks must work hard.',
    shapeBias: 'compact',
    slots: [
      { id: 'gk', label: 'GK', acceptedPositions: ['GK'], roleGroup: 'goalkeeper', x: 50, y: 90 },
      { id: 'cb1', label: 'CB', acceptedPositions: ['CB', 'LB'], roleGroup: 'defense', x: 30, y: 74 },
      { id: 'cb2', label: 'CB', acceptedPositions: ['CB'], roleGroup: 'defense', x: 50, y: 78 },
      { id: 'cb3', label: 'CB', acceptedPositions: ['CB', 'RB'], roleGroup: 'defense', x: 70, y: 74 },
      { id: 'lwb', label: 'LWB', acceptedPositions: ['LWB', 'LB', 'LM', 'LW'], roleGroup: 'midfield', x: 14, y: 50 },
      { id: 'dm', label: 'DM', acceptedPositions: ['DM', 'CM'], roleGroup: 'midfield', x: 42, y: 57 },
      { id: 'cm', label: 'CM', acceptedPositions: ['CM', 'AM', 'DM'], roleGroup: 'midfield', x: 58, y: 52 },
      { id: 'am', label: 'AM', acceptedPositions: ['AM', 'CM', 'LW', 'RW'], roleGroup: 'midfield', x: 50, y: 38 },
      { id: 'rwb', label: 'RWB', acceptedPositions: ['RWB', 'RB', 'RM', 'RW'], roleGroup: 'midfield', x: 86, y: 50 },
      { id: 'st1', label: 'ST', acceptedPositions: ['ST', 'LW'], roleGroup: 'attack', x: 40, y: 20 },
      { id: 'st2', label: 'ST', acceptedPositions: ['ST', 'RW'], roleGroup: 'attack', x: 60, y: 20 },
    ],
  },
  {
    id: '4231',
    name: '4-2-3-1',
    nickname: 'Playmaker Net',
    description: 'A double pivot gives the attacking trio freedom to feed one central striker.',
    shapeBias: 'front-foot',
    slots: [
      { id: 'gk', label: 'GK', acceptedPositions: ['GK'], roleGroup: 'goalkeeper', x: 50, y: 90 },
      { id: 'lb', label: 'LB', acceptedPositions: ['LB', 'LWB'], roleGroup: 'defense', x: 18, y: 72 },
      { id: 'cb1', label: 'CB', acceptedPositions: ['CB'], roleGroup: 'defense', x: 38, y: 74 },
      { id: 'cb2', label: 'CB', acceptedPositions: ['CB'], roleGroup: 'defense', x: 62, y: 74 },
      { id: 'rb', label: 'RB', acceptedPositions: ['RB', 'RWB'], roleGroup: 'defense', x: 82, y: 72 },
      { id: 'dm1', label: 'DM', acceptedPositions: ['DM', 'CM'], roleGroup: 'midfield', x: 40, y: 56 },
      { id: 'dm2', label: 'DM', acceptedPositions: ['DM', 'CM'], roleGroup: 'midfield', x: 60, y: 56 },
      { id: 'lw', label: 'LW', acceptedPositions: ['LW', 'LM', 'AM'], roleGroup: 'attack', x: 18, y: 34 },
      { id: 'am', label: 'AM', acceptedPositions: ['AM', 'CM', 'RW', 'LW'], roleGroup: 'midfield', x: 50, y: 32 },
      { id: 'rw', label: 'RW', acceptedPositions: ['RW', 'RM', 'AM'], roleGroup: 'attack', x: 82, y: 34 },
      { id: 'st', label: 'ST', acceptedPositions: ['ST'], roleGroup: 'attack', x: 50, y: 16 },
    ],
  },
];

export const getFormationById = (id: string) => formations.find((formation) => formation.id === id);

export const createEmptyLineup = (formation: Formation) =>
  formation.slots.reduce<Record<string, string | null>>((lineup, slot) => {
    lineup[slot.id] = null;
    return lineup;
  }, {});
