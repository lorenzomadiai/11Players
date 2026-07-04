import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TournamentResultPanel from '../TournamentResultPanel';
import { buildOpponentXI } from '../../game-engine/opponent';
import { createTournament } from '../../game-engine/tournament';
import { simulateTournament } from '../../game-engine/tournamentProgression';
import { requireSquad } from '../../test/fixtures';

const tournamentResult = () => {
  const squad = requireSquad('bra-2002');
  const xi = buildOpponentXI(squad);

  return simulateTournament({
    tournament: createTournament({ seed: 'component-tournament', userTeamStrength: 86 }),
    dreamTeam: {
      id: 'dream-xi',
      name: 'Dream XI',
      formation: xi.formation,
      lineup: xi.lineup,
      evaluation: xi.evaluation,
      style: 'balanced',
    },
  });
};

describe('TournamentResultPanel', () => {
  it('renders tournament outcome, user run, group table, and bracket', () => {
    render(<TournamentResultPanel result={tournamentResult()} onReplay={vi.fn()} onNewDraw={vi.fn()} />);

    expect(screen.getByText(/World Cup demo complete/i)).toBeInTheDocument();
    expect(screen.getByText(/Champion:/i)).toBeInTheDocument();
    expect(screen.getByText(/Your Match Timeline/i)).toBeInTheDocument();
    expect(screen.getByText(/Knockout Bracket/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Replay Draw/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Draw/i })).toBeInTheDocument();
  });
});
