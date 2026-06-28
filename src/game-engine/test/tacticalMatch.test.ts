import { describe, expect, it } from 'vitest';
import { requireSquad } from '../../test/fixtures';
import { createSeededRng } from '../../utils/seededRandom';
import { buildOpponentXI } from '../opponent';
import { simulateTacticalMatch } from '../tacticalMatch';

const tacticalInput = (squadId: string) => {
  const opponent = buildOpponentXI(requireSquad(squadId));

  return {
    id: opponent.squad.id,
    name: `${opponent.squad.country} ${opponent.squad.year}`,
    formation: opponent.formation,
    lineup: opponent.lineup,
    evaluation: opponent.evaluation,
    style: 'balanced' as const,
  };
};

describe('tactical match simulation', () => {
  it('produces deterministic XI-vs-XI timelines with xG and explanations', () => {
    const home = tacticalInput('bra-2002');
    const away = tacticalInput('ita-2006');
    const first = simulateTacticalMatch(home, away, { rng: createSeededRng('bra-ita-final') });
    const second = simulateTacticalMatch(home, away, { rng: createSeededRng('bra-ita-final') });

    expect(first).toEqual(second);
    expect(first.events.length).toBeGreaterThan(6);
    expect(first.homeXg).toBeGreaterThan(0);
    expect(first.awayXg).toBeGreaterThan(0);
    expect(first.homeGoals).toBe(first.events.filter((event) => event.side === 'home' && event.goal).length);
    expect(first.awayGoals).toBe(first.events.filter((event) => event.side === 'away' && event.goal).length);
    expect(first.reasons).toHaveLength(4);
  });

  it('assigns scorers, assists, and metric reasons to goal events', () => {
    const result = simulateTacticalMatch(tacticalInput('ger-2014'), tacticalInput('crc-2014'), {
      rng: createSeededRng('goal-detail-check'),
    });
    const goalEvents = result.events.filter((event) => event.goal);

    expect(goalEvents.length).toBeGreaterThan(0);
    goalEvents.forEach((event) => {
      expect(event.scorerId).toBeTruthy();
      expect(event.scorerName).toBeTruthy();
      expect(event.reason).toContain('xG');
      expect(event.metrics.finisherScore).toBeGreaterThan(0);
      expect(event.metrics.keeperResistance).toBeGreaterThan(0);
      expect(event.metrics.roll).toBeGreaterThanOrEqual(0);
      expect(event.metrics.roll).toBeLessThanOrEqual(1);
    });
  });

  it('resolves knockout draws with a winner through extra time or penalties', () => {
    const result = simulateTacticalMatch(tacticalInput('sui-2018'), tacticalInput('swe-1994'), {
      knockout: true,
      rng: createSeededRng('knockout-resolution'),
    });

    expect(result.winnerSide).toMatch(/home|away/);
    expect(result.resolution).toMatch(/regular|extra-time|penalties/);
    if (result.resolution === 'penalties') {
      expect(result.penalties).toBeDefined();
      expect(result.penalties?.home).not.toBe(result.penalties?.away);
    }
  });
});
