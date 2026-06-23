import { getSquadById } from '../data/mockData';
import { getDifficultyById } from '../game-engine/difficulty';
import { getFormationById } from '../game-engine/formations';
import type { Difficulty, DifficultyId, Formation, LineupSelection, Player, Squad } from '../types/game';
import type { RandomSource } from '../utils/random';

export const requireSquad = (id = 'bra-2002'): Squad => {
  const squad = getSquadById(id);
  if (!squad) {
    throw new Error(`Missing test squad: ${id}`);
  }
  return squad;
};

export const requireFormation = (id = '433'): Formation => {
  const formation = getFormationById(id);
  if (!formation) {
    throw new Error(`Missing test formation: ${id}`);
  }
  return formation;
};

export const requireDifficulty = (id: DifficultyId = 'classic'): Difficulty => getDifficultyById(id);

export const requirePlayer = (squad: Squad, id: string): Player => {
  const player = squad.players.find((item) => item.id === id);
  if (!player) {
    throw new Error(`Missing test player: ${id}`);
  }
  return player;
};

export const brazil433Lineup = (): LineupSelection => {
  const squad = requireSquad('bra-2002');

  return {
    gk: requirePlayer(squad, 'bra-2002-marcos'),
    lb: requirePlayer(squad, 'bra-2002-roberto-carlos'),
    cb1: requirePlayer(squad, 'bra-2002-lucio'),
    cb2: requirePlayer(squad, 'bra-2002-roque-junior'),
    rb: requirePlayer(squad, 'bra-2002-cafu'),
    dm: requirePlayer(squad, 'bra-2002-gilberto-silva'),
    cm1: requirePlayer(squad, 'bra-2002-kleberson'),
    cm2: requirePlayer(squad, 'bra-2002-juninho-paulista'),
    lw: requirePlayer(squad, 'bra-2002-rivaldo'),
    st: requirePlayer(squad, 'bra-2002-ronaldo'),
    rw: requirePlayer(squad, 'bra-2002-ronaldinho'),
  };
};

export const sequenceRng = (values: number[]): RandomSource => {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
};
