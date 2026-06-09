import { useEffect, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader';
import { getSquadById } from './data/mockData';
import { createRandomDraw } from './game-engine/draw';
import { getDifficultyById } from './game-engine/difficulty';
import { evaluateLineup } from './game-engine/evaluation';
import { createEmptyLineup, getFormationById } from './game-engine/formations';
import { simulateMatch } from './game-engine/simulation';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import type { DifficultyId, PersistedGameState } from './types/game';
import { loadFromStorage, saveToStorage } from './utils/storage';

const STORAGE_KEY = 'dream-world-cup-xi-state';

const initialState: PersistedGameState = {
  phase: 'landing',
  draw: null,
  lineup: {},
  difficultyId: 'classic',
  exactScoreMode: false,
  theme: 'dark',
  result: null,
};

export default function App() {
  const [state, setState] = useState<PersistedGameState>(() => loadFromStorage(STORAGE_KEY, initialState));

  const squad = state.draw ? getSquadById(state.draw.squadId) : undefined;
  const formation = state.draw ? getFormationById(state.draw.formationId) : undefined;
  const difficulty = getDifficultyById(state.difficultyId);

  const canShowGame = Boolean(state.draw && squad && formation);

  const evaluation = useMemo(() => {
    if (!state.draw || !squad || !formation) {
      return null;
    }

    return evaluateLineup(squad, formation, state.lineup, difficulty, state.draw.challengeId);
  }, [difficulty, formation, squad, state.draw, state.lineup]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    saveToStorage(STORAGE_KEY, state);
  }, [state]);

  const startGame = () => {
    const draw = createRandomDraw();
    const nextFormation = getFormationById(draw.formationId);

    if (!nextFormation) {
      return;
    }

    setState((current) => ({
      ...current,
      phase: 'selection',
      draw,
      lineup: createEmptyLineup(nextFormation),
      result: null,
    }));
  };

  const resetToLanding = () => {
    setState((current) => ({
      ...initialState,
      difficultyId: current.difficultyId,
      exactScoreMode: current.exactScoreMode,
      theme: current.theme,
    }));
  };

  const replayDraw = () => {
    if (!formation) {
      resetToLanding();
      return;
    }

    setState((current) => ({
      ...current,
      phase: 'selection',
      lineup: createEmptyLineup(formation),
      result: null,
    }));
  };

  const selectPlayer = (slotId: string, playerId: string) => {
    setState((current) => {
      const alreadyUsedElsewhere = Object.entries(current.lineup).some(([lineupSlotId, selectedPlayerId]) => {
        return lineupSlotId !== slotId && selectedPlayerId === playerId;
      });

      if (alreadyUsedElsewhere) {
        return current;
      }

      return {
        ...current,
        lineup: {
          ...current.lineup,
          [slotId]: playerId,
        },
        result: null,
        phase: 'selection',
      };
    });
  };

  const clearSlot = (slotId: string) => {
    setState((current) => ({
      ...current,
      lineup: {
        ...current.lineup,
        [slotId]: null,
      },
      result: null,
      phase: 'selection',
    }));
  };

  const simulate = () => {
    if (!squad || !formation || !evaluation || !evaluation.isComplete) {
      return;
    }

    setState((current) => ({
      ...current,
      phase: 'result',
      result: simulateMatch(squad, formation, evaluation, difficulty, current.exactScoreMode),
    }));
  };

  const setDifficulty = (difficultyId: DifficultyId) => {
    setState((current) => ({ ...current, difficultyId, result: null }));
  };

  return (
    <div className="app-shell">
      <AppHeader
        theme={state.theme}
        onThemeToggle={() =>
          setState((current) => ({ ...current, theme: current.theme === 'dark' ? 'light' : 'dark' }))
        }
        onReset={resetToLanding}
      />

      {canShowGame && state.draw && squad && formation ? (
        <GamePage
          draw={state.draw}
          squad={squad}
          formation={formation}
          lineup={state.lineup}
          difficultyId={state.difficultyId}
          exactScoreMode={state.exactScoreMode}
          result={state.result}
          onSelectPlayer={selectPlayer}
          onClearSlot={clearSlot}
          onSimulate={simulate}
          onReplay={replayDraw}
          onNewDraw={startGame}
        />
      ) : (
        <LandingPage
          difficultyId={state.difficultyId}
          exactScoreMode={state.exactScoreMode}
          onDifficultyChange={setDifficulty}
          onExactScoreModeChange={(enabled) => setState((current) => ({ ...current, exactScoreMode: enabled }))}
          onStart={startGame}
        />
      )}
    </div>
  );
}
