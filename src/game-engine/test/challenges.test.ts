import { describe, expect, it } from 'vitest';
import { getChallengeById } from '../challenges';
import { brazil433Lineup, requirePlayer, requireSquad } from '../../test/fixtures';
import type { Player } from '../../types/game';

describe('challenges', () => {
  it('penalizes Ballon d Or winners when that challenge is active', () => {
    const lineup = brazil433Lineup();
    const players = Object.values(lineup).filter((player): player is Player => player !== null);

    const report = getChallengeById('no-ballon-dor').evaluate(players);

    expect(report.passed).toBe(false);
    expect(report.penalty).toBe(18);
    expect(report.notes[0]).toContain('Rivaldo');
    expect(report.notes[0]).toContain('Ronaldinho');
    expect(report.notes[0]).toContain('Ronaldo');
  });

  it('detects repeated clubs and scales the one-player-per-club penalty', () => {
    const squad = requireSquad();
    const players = [
      'bra-2002-marcos',
      'bra-2002-dida',
      'bra-2002-cafu',
      'bra-2002-roberto-carlos',
      'bra-2002-lucio',
      'bra-2002-roque-junior',
      'bra-2002-gilberto-silva',
      'bra-2002-kleberson',
      'bra-2002-juninho-paulista',
      'bra-2002-denilson',
      'bra-2002-belletti',
    ].map((id) => requirePlayer(squad, id));

    const report = getChallengeById('one-player-per-club').evaluate(players);

    expect(report.passed).toBe(false);
    expect(report.penalty).toBe(5);
    expect(report.notes).toContain('AC Milan has 2 starters.');
  });

  it('only passes challenge reports when a full legal XI satisfies the rule', () => {
    const squad = requireSquad();
    const noBallonDorPlayers = [
      'bra-2002-marcos',
      'bra-2002-dida',
      'bra-2002-cafu',
      'bra-2002-roberto-carlos',
      'bra-2002-lucio',
      'bra-2002-roque-junior',
      'bra-2002-edmilson',
      'bra-2002-gilberto-silva',
      'bra-2002-kleberson',
      'bra-2002-juninho-paulista',
      'bra-2002-denilson',
    ].map((id) => requirePlayer(squad, id));

    const challenge = getChallengeById('no-ballon-dor');

    expect(challenge.evaluate(noBallonDorPlayers.slice(0, 10)).passed).toBe(false);
    expect(challenge.evaluate(noBallonDorPlayers).passed).toBe(true);
  });
});
