import { describe, expect, it } from 'vitest';
import { requireFormation, requireSquad } from '../../test/fixtures';
import type { Player } from '../../types/game';
import { buildOpponentLineup, buildOpponentXI, playerSlotScore } from '../opponent';

describe('opponent XI builder', () => {
  it('builds a complete legal lineup without duplicate players', () => {
    const squad = requireSquad('ger-2014');
    const formation = requireFormation('433');
    const lineup = buildOpponentLineup(squad, formation);
    const players = Object.values(lineup).filter((player): player is Player => Boolean(player));

    expect(players).toHaveLength(11);
    expect(new Set(players.map((player) => player.id)).size).toBe(11);
    expect(lineup.gk?.positions).toContain('GK');
  });

  it('chooses a deterministic strongest formation and evaluates the XI', () => {
    const squad = requireSquad('ita-2006');
    const first = buildOpponentXI(squad);
    const second = buildOpponentXI(squad);

    expect(first.formation.id).toBe(second.formation.id);
    expect(first.lineup).toEqual(second.lineup);
    expect(first.evaluation.isComplete).toBe(true);
    expect(first.evaluation.overall).toBeGreaterThan(70);
    expect(first.evaluation.duplicatePlayerIds).toEqual([]);
  });

  it('rewards natural slot fit over badly mismatched star power', () => {
    const squad = requireSquad('bra-2002');
    const formation = requireFormation('433');
    const gkSlot = formation.slots.find((slot) => slot.id === 'gk')!;
    const stSlot = formation.slots.find((slot) => slot.id === 'st')!;
    const keeper = squad.players.find((player) => player.id === 'bra-2002-marcos')!;
    const striker = squad.players.find((player) => player.id === 'bra-2002-ronaldo')!;

    expect(playerSlotScore(gkSlot, keeper)).toBeGreaterThan(playerSlotScore(gkSlot, striker));
    expect(playerSlotScore(stSlot, striker)).toBeGreaterThan(playerSlotScore(stSlot, keeper));
  });
});
