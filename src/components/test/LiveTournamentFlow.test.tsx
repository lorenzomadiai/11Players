import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LiveTournamentFlow from '../LiveTournamentFlow';
import { buildOpponentXI } from '../../game-engine/opponent';
import { createTournament } from '../../game-engine/tournament';
import { simulateTournament } from '../../game-engine/tournamentProgression';
import { requireSquad } from '../../test/fixtures';
import type { TournamentMatch, TournamentSimulationResult } from '../../types/game';

const tournamentResult = () => {
  const squad = requireSquad('bra-2002');
  const xi = buildOpponentXI(squad);

  return simulateTournament({
    tournament: createTournament({ seed: 'live-flow-component', userTeamStrength: 86 }),
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

const userMatches = (result: TournamentSimulationResult): TournamentMatch[] =>
  [...result.tournament.groupMatches, ...result.tournament.knockoutMatches].filter(
    (match) => match.homeTeamId === result.tournament.userTeamId || match.awayTeamId === result.tournament.userTeamId,
  );

const eventText = (teamName: string, chanceType: string, xg: number) =>
  screen.getByText((_content, node) => {
    const text = node?.textContent ?? '';

    return node instanceof HTMLElement && node.classList.contains('live-event') && text.includes(teamName) && text.includes(chanceType) && text.includes(`xG ${xg.toFixed(2)}`);
  });

describe('LiveTournamentFlow', () => {
  it('starts on the first match instead of showing the final summary', () => {
    const result = tournamentResult();
    const firstMatch = userMatches(result)[0];

    render(<LiveTournamentFlow result={result} onReplay={vi.fn()} onNewDraw={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Start Match/i })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${firstMatch.result?.homeTeam.name ?? ''} vs`, 'i'))).toBeInTheDocument();
    expect(screen.queryByText(/World Cup demo complete/i)).not.toBeInTheDocument();
  });

  it('reveals tactical events one by one after kickoff', () => {
    const result = tournamentResult();
    const firstEvent = userMatches(result)[0].result?.events[0];

    if (!firstEvent) {
      throw new Error('Expected the tournament engine to generate at least one user match event.');
    }

    render(<LiveTournamentFlow result={result} onReplay={vi.fn()} onNewDraw={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Start Match/i }));
    expect(screen.getByText(/No important event has happened yet/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Next Event/i }));

    expect(eventText(firstEvent.teamName, firstEvent.chanceType, firstEvent.xg)).toBeInTheDocument();
  });

  it('only shows the tournament summary after the user run has been played through', () => {
    const result = tournamentResult();
    const matches = userMatches(result);

    render(<LiveTournamentFlow result={result} onReplay={vi.fn()} onNewDraw={vi.fn()} />);

    matches.forEach((match, index) => {
      fireEvent.click(screen.getByRole('button', { name: /Start Match/i }));

      (match.result?.events ?? []).forEach(() => {
        fireEvent.click(screen.getByRole('button', { name: /Next Event/i }));
      });

      expect(screen.queryByText(/World Cup demo complete/i)).not.toBeInTheDocument();
      fireEvent.click(
        screen.getByRole('button', {
          name: index < matches.length - 1 ? /Continue Tournament/i : /Show Tournament Summary/i,
        }),
      );
    });

    expect(screen.getByText(/World Cup demo complete/i)).toBeInTheDocument();
  });
});
