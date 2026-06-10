import { squads } from '../data/mockData';
import type { GameDraw, Squad } from '../types/game';
import { randomItem } from '../utils/random';
import { freePlayChallenge } from './challenges';

const buildDraw = (squad: Squad, formationId: string): GameDraw => ({
  squadId: squad.id,
  formationId,
  challengeId: freePlayChallenge.id,
});

export const createDraw = (formationId: string): GameDraw => buildDraw(randomItem(squads), formationId);

/** Fully random next draw after a player is placed (avoids repeating the current squad back to back). */
export const nextRandomDraw = (draw: GameDraw): GameDraw => {
  const others = squads.filter((squad) => squad.id !== draw.squadId);
  return buildDraw(randomItem(others.length > 0 ? others : squads), draw.formationId);
};

/**
 * Demo pool is small, so both rerolls fall back to "any other squad" when no
 * strict match exists. Once the real database lands, the preferred filters
 * (same year / same country) will naturally start winning.
 */
const pickOtherSquad = (currentSquadId: string, prefer: (squad: Squad) => boolean) => {
  const others = squads.filter((squad) => squad.id !== currentSquadId);
  const preferred = others.filter(prefer);
  return randomItem(preferred.length > 0 ? preferred : others);
};

export const changeTeamDraw = (draw: GameDraw): GameDraw => {
  const current = squads.find((squad) => squad.id === draw.squadId);
  const next = pickOtherSquad(
    draw.squadId,
    (squad) => squad.year === current?.year && squad.countryCode !== current?.countryCode,
  );
  return buildDraw(next, draw.formationId);
};

export const changeYearDraw = (draw: GameDraw): GameDraw => {
  const current = squads.find((squad) => squad.id === draw.squadId);
  const next = pickOtherSquad(
    draw.squadId,
    (squad) => squad.countryCode === current?.countryCode && squad.year !== current?.year,
  );
  return buildDraw(next, draw.formationId);
};
