import { useEffect, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader';
import { getSquadById } from './data/mockData';
import { changeTeamDraw, changeYearDraw, createDraw, nextRandomDraw } from './game-engine/draw';
import { getDifficultyById } from './game-engine/difficulty';
import { evaluateLineup } from './game-engine/evaluation';
import { createEmptyLineup, getFormationById } from './game-engine/formations';
import { simulateMatch } from './game-engine/simulation';
import LandingPage from './pages/LandingPage';
import SetupPage from './pages/SetupPage';
import GamePage from './pages/GamePage';
import type { DifficultyId, GameDraw, PersistedGameState, Player, TeamStyle } from './types/game';
import { loadFromStorage, saveToStorage } from './utils/storage';

const STORAGE_KEY = 'dream-world-cup-xi-state-v2';
const TOTAL_REROLLS = 5;

const initialState: PersistedGameState = {
  phase: 'landing',
  draw: null,
  lineup: {},
  difficultyId: 'classic',
  teamStyle: 'balanced',
  rerollsLeft: TOTAL_REROLLS,
  exactScoreMode: false,
  theme: 'dark',
  result: null,
};

export default function App() {
  const [state, setState] = useState<PersistedGameState>(() => ({
    ...initialState,
    ...loadFromStorage(STORAGE_KEY, initialState),
  }));

  const squad = state.draw ? getSquadById(state.draw.squadId) : undefined;
  const formation = state.draw ? getFormationById(state.draw.formationId) : undefined;
  const difficulty = getDifficultyById(state.difficultyId);

  const canShowGame =
    (state.phase === 'selection' || state.phase === 'result') && Boolean(state.draw && squad && formation);

  const evaluation = useMemo(() => {
    if (!state.draw || !formation) {
      return null;
    }

    return evaluateLineup(formation, state.lineup, difficulty, state.draw.challengeId);
  }, [difficulty, formation, state.draw, state.lineup]);

  useEffect(() => {
    document.documentElement.dataset.theme = state.theme;
    saveToStorage(STORAGE_KEY, state);
  }, [state]);

  const goToSetup = () => {
    setState((current) => ({
      ...current,
      phase: 'setup',
      draw: null,
      lineup: {},
      result: null,
      rerollsLeft: TOTAL_REROLLS,
    }));
  };

  const startDraft = (formationId: string, teamStyle: TeamStyle) => {
    const draw = createDraw(formationId);
    const nextFormation = getFormationById(formationId);

    if (!nextFormation) {
      return;
    }

    setState((current) => ({
      ...current,
      phase: 'selection',
      draw,
      teamStyle,
      lineup: createEmptyLineup(nextFormation),
      rerollsLeft: TOTAL_REROLLS,
      result: null,
    }));
  };

  // Skipping a draw keeps every player already placed; it only swaps the squad on offer.
  const applyReroll = (nextDraw: GameDraw) => {
    setState((current) => {
      if (current.rerollsLeft <= 0) {
        return current;
      }

      return {
        ...current,
        draw: nextDraw,
        rerollsLeft: current.rerollsLeft - 1,
      };
    });
  };

  const changeTeam = () => {
    if (state.draw) {
      applyReroll(changeTeamDraw(state.draw));
    }
  };

  const changeYear = () => {
    if (state.draw) {
      applyReroll(changeYearDraw(state.draw));
    }
  };

  const resetToLanding = () => {
    setState((current) => ({
      ...initialState,
      difficultyId: current.difficultyId,
      teamStyle: current.teamStyle,
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
      rerollsLeft: TOTAL_REROLLS,
      result: null,
    }));
  };

  // Placing a player locks the pick and immediately spins a fresh random team + year.
  const placePlayer = (slotId: string, player: Player) => {
    setState((current) => {
      const alreadyUsedElsewhere = Object.entries(current.lineup).some(([lineupSlotId, picked]) => {
        return lineupSlotId !== slotId && picked?.id === player.id;
      });

      if (alreadyUsedElsewhere || !current.draw) {
        return current;
      }

      return {
        ...current,
        lineup: {
          ...current.lineup,
          [slotId]: player,
        },
        draw: nextRandomDraw(current.draw),
        result: null,
        phase: 'selection',
      };
    });
  };

  const simulate = () => {
    if (!formation || !evaluation || !evaluation.isComplete) {
      return;
    }

    setState((current) => ({
      ...current,
      phase: 'result',
      result: simulateMatch(formation, evaluation, difficulty, current.exactScoreMode),
    }));
  };

  const setDifficulty = (difficultyId: DifficultyId) => {
    setState((current) => ({ ...current, difficultyId, result: null }));
  };

  return (
    <div
      className={
        state.phase === 'landing' || state.phase === 'setup' ? 'app-shell app-shell--landing' : 'app-shell'
      }
    >
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
          rerollsLeft={state.rerollsLeft}
          result={state.result}
          onPlacePlayer={placePlayer}
          onSimulate={simulate}
          onReplay={replayDraw}
          onNewDraw={goToSetup}
          onChangeTeam={changeTeam}
          onChangeYear={changeYear}
        />
      ) : state.phase === 'setup' ? (
        <SetupPage initialStyle={state.teamStyle} onDraft={startDraft} />
      ) : (
        <LandingPage
          difficultyId={state.difficultyId}
          exactScoreMode={state.exactScoreMode}
          onDifficultyChange={setDifficulty}
          onExactScoreModeChange={(enabled) => setState((current) => ({ ...current, exactScoreMode: enabled }))}
          onStart={goToSetup}
        />
      )}
    </div>
  );
}
