import { useEffect, useMemo, useState } from 'react';
import AppHeader from './components/AppHeader';
import { getSquadById } from './data/mockData';
import { changeTeamDraw, changeYearDraw, createDraw, nextRandomDraw } from './game-engine/draw';
import { getDifficultyById } from './game-engine/difficulty';
import { evaluateLineup } from './game-engine/evaluation';
import { createEmptyLineup, getFormationById } from './game-engine/formations';
import { createTournament } from './game-engine/tournament';
import { simulateTournament } from './game-engine/tournamentProgression';
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
  pendingSlotId: null,
  difficultyId: 'classic',
  teamStyle: 'balanced',
  rerollsLeft: TOTAL_REROLLS,
  exactScoreMode: false,
  theme: 'dark',
  result: null,
  tournamentResult: null,
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
      pendingSlotId: null,
      result: null,
      tournamentResult: null,
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
      pendingSlotId: null,
      rerollsLeft: TOTAL_REROLLS,
      result: null,
      tournamentResult: null,
    }));
  };

  // Skipping a draw keeps every locked player; it only swaps the squad on offer.
  // Not allowed while a provisional pick from the current draw is on the pitch.
  const applyReroll = (nextDraw: GameDraw) => {
    setState((current) => {
      if (current.rerollsLeft <= 0 || current.pendingSlotId) {
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
      tournamentResult: null,
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
      pendingSlotId: null,
      rerollsLeft: TOTAL_REROLLS,
      result: null,
      tournamentResult: null,
    }));
  };

  // Placement stays provisional: the player can still be swapped until Continue Draft locks them in.
  const placePlayer = (slotId: string, player: Player) => {
    setState((current) => {
      const alreadyUsedElsewhere = Object.entries(current.lineup).some(([lineupSlotId, picked]) => {
        return lineupSlotId !== slotId && lineupSlotId !== current.pendingSlotId && picked?.id === player.id;
      });

      if (alreadyUsedElsewhere || !current.draw) {
        return current;
      }

      const lineup = { ...current.lineup, [slotId]: player };

      // Moving the provisional pick to a new spot frees the previous slot.
      if (current.pendingSlotId && current.pendingSlotId !== slotId) {
        lineup[current.pendingSlotId] = null;
      }

      return {
        ...current,
        lineup,
        pendingSlotId: slotId,
        result: null,
        tournamentResult: null,
        phase: 'selection',
      };
    });
  };

  // Undo the provisional pick so another player from the same draw can be tried.
  const removeProvisional = () => {
    setState((current) => {
      if (!current.pendingSlotId) {
        return current;
      }

      return {
        ...current,
        lineup: { ...current.lineup, [current.pendingSlotId]: null },
        pendingSlotId: null,
      };
    });
  };

  // Locks the provisional pick and spins a fresh random team + year.
  const continueDraft = () => {
    setState((current) => {
      if (!current.pendingSlotId || !current.draw) {
        return current;
      }

      return {
        ...current,
        pendingSlotId: null,
        draw: nextRandomDraw(current.draw),
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
      pendingSlotId: null,
      result: null,
      tournamentResult: simulateTournament({
        tournament: createTournament({
          // A kickoff seed makes this whole tournament stable once stored,
          // while each new kickoff still creates a fresh bracket/result set.
          seed: `demo-${Date.now()}-${current.difficultyId}-${Math.round(evaluation.overall)}`,
          difficultyId: current.difficultyId,
          userTeamStrength: Math.round(evaluation.overall),
        }),
        // The draft screen owns the user's XI; this is the single adapter that
        // turns that lineup into the tournament engine's Dream XI team.
        dreamTeam: {
          id: 'dream-xi',
          name: 'Dream XI',
          formation,
          lineup: current.lineup,
          evaluation,
          style: current.teamStyle,
        },
      }),
    }));
  };

  const setDifficulty = (difficultyId: DifficultyId) => {
    setState((current) => ({ ...current, difficultyId, result: null, tournamentResult: null }));
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
          pendingSlotId={state.pendingSlotId}
          difficultyId={state.difficultyId}
          exactScoreMode={state.exactScoreMode}
          rerollsLeft={state.rerollsLeft}
          result={state.result}
          tournamentResult={state.tournamentResult}
          onPlacePlayer={placePlayer}
          onRemoveProvisional={removeProvisional}
          onContinueDraft={continueDraft}
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
