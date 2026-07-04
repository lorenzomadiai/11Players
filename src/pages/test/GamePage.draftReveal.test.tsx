import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GamePage from '../GamePage';
import { freePlayChallenge } from '../../game-engine/challenges';
import { createEmptyLineup } from '../../game-engine/formations';
import { requireFormation, requireSquad } from '../../test/fixtures';
import type { GameDraw, Squad } from '../../types/game';

const finishDrawReveal = () => {
  act(() => {
    vi.advanceTimersByTime(1200);
  });
};

describe('GamePage - draft reveal sequence', () => {
  const firstSquad = requireSquad('bra-2002');
  const nextSquad = requireSquad('arg-2022');
  const formation = requireFormation('433');

  const drawFor = (squad: Squad): GameDraw => ({
    squadId: squad.id,
    formationId: formation.id,
    challengeId: freePlayChallenge.id,
  });

  function DraftHarness() {
    const [squad, setSquad] = useState(firstSquad);
    const [pendingSlotId, setPendingSlotId] = useState<string | null>('gk');

    return (
      <GamePage
        draw={drawFor(squad)}
        squad={squad}
        formation={formation}
        lineup={createEmptyLineup(formation)}
        pendingSlotId={pendingSlotId}
        difficultyId="classic"
        exactScoreMode={false}
        rerollsLeft={5}
        result={null}
        onPlacePlayer={vi.fn()}
        onRemoveProvisional={vi.fn()}
        onContinueDraft={() => {
          setSquad(nextSquad);
          setPendingSlotId(null);
        }}
        onSimulate={vi.fn()}
        onReplay={vi.fn()}
        onNewDraw={vi.fn()}
        onChangeTeam={vi.fn()}
        onChangeYear={vi.fn()}
      />
    );
  }

  beforeEach(() => {
    vi.useFakeTimers();
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('keeps the next squad names hidden until the draw reel finishes', () => {
    render(<DraftHarness />);

    expect(screen.getByText(/Awaiting final draw/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cafu/i })).not.toBeInTheDocument();

    finishDrawReveal();

    expect(screen.getByRole('button', { name: /Cafu/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Continue Draft/i }));

    expect(screen.getByText(/Awaiting final draw/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Messi/i })).not.toBeInTheDocument();

    finishDrawReveal();

    expect(screen.getByRole('button', { name: /Messi/i })).toBeInTheDocument();
  });
});
