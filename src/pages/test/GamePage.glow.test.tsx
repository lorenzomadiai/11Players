import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import GamePage from '../GamePage';
import { freePlayChallenge } from '../../game-engine/challenges';
import { createEmptyLineup } from '../../game-engine/formations';
import { requireFormation, requireSquad } from '../../test/fixtures';
import type { GameDraw } from '../../types/game';

describe('GamePage — Continue Draft attention glow', () => {
  const squad = requireSquad('bra-2002');
  const formation = requireFormation('433');
  const draw: GameDraw = { squadId: squad.id, formationId: formation.id, challengeId: freePlayChallenge.id };

  const finishDrawReveal = () => {
    act(() => {
      vi.advanceTimersByTime(1200);
    });
  };

  const renderPage = () =>
    render(
      <GamePage
        draw={draw}
        squad={squad}
        formation={formation}
        lineup={createEmptyLineup(formation)}
        pendingSlotId={null}
        difficultyId="classic"
        exactScoreMode={false}
        rerollsLeft={5}
        result={null}
        onPlacePlayer={vi.fn()}
        onRemoveProvisional={vi.fn()}
        onContinueDraft={vi.fn()}
        onSimulate={vi.fn()}
        onReplay={vi.fn()}
        onNewDraw={vi.fn()}
        onChangeTeam={vi.fn()}
        onChangeYear={vi.fn()}
      />,
    );

  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom implements none of these; GamePage/SquadList call them during pick/place.
    Element.prototype.scrollIntoView = vi.fn();
    Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
    // The glow is fired inside a requestAnimationFrame; run it synchronously so the
    // assertion is deterministic instead of racing a real animation frame.
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('glows the Continue Draft button only after a player is placed on the pitch', () => {
    renderPage();
    finishDrawReveal();

    const continueButton = screen.getByRole('button', { name: /Continue Draft/i });
    expect(continueButton).not.toHaveClass('is-glowing');

    // Pick the goalkeeper, then drop him on the highlighted GK slot.
    fireEvent.click(screen.getByRole('button', { name: /Marcos/i }));
    fireEvent.click(screen.getByRole('button', { name: /Place here/i }));

    expect(continueButton).toHaveClass('is-glowing');
  });
});
