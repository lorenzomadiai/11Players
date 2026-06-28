import { useMemo, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import DraftBanner from '../components/DraftBanner';
import Pitch from '../components/Pitch';
import ResultPanel from '../components/ResultPanel';
import SelectedXI from '../components/SelectedXI';
import SquadList from '../components/SquadList';
import TournamentResultPanel from '../components/TournamentResultPanel';
import { getDifficultyById } from '../game-engine/difficulty';
import { evaluateLineup } from '../game-engine/evaluation';
import type {
  DifficultyId,
  Formation,
  GameDraw,
  LineupSelection,
  MatchResult,
  Player,
  Squad,
  TournamentSimulationResult,
} from '../types/game';

interface GamePageProps {
  draw: GameDraw;
  squad: Squad;
  formation: Formation;
  lineup: LineupSelection;
  pendingSlotId: string | null;
  difficultyId: DifficultyId;
  exactScoreMode: boolean;
  rerollsLeft: number;
  result: MatchResult | null;
  tournamentResult?: TournamentSimulationResult | null;
  onPlacePlayer: (slotId: string, player: Player) => void;
  onRemoveProvisional: () => void;
  onContinueDraft: () => void;
  onSimulate: () => void;
  onReplay: () => void;
  onNewDraw: () => void;
  onChangeTeam: () => void;
  onChangeYear: () => void;
}

export default function GamePage({
  squad,
  formation,
  lineup,
  pendingSlotId,
  difficultyId,
  rerollsLeft,
  result,
  tournamentResult = null,
  draw,
  onPlacePlayer,
  onRemoveProvisional,
  onContinueDraft,
  onSimulate,
  onReplay,
  onNewDraw,
  onChangeTeam,
  onChangeYear,
}: GamePageProps) {
  const [pendingPlayer, setPendingPlayer] = useState<Player | null>(null);
  const [glowing, setGlowing] = useState(false);
  const pitchRef = useRef<HTMLElement>(null);
  const squadRef = useRef<HTMLElement>(null);

  const difficulty = getDifficultyById(difficultyId);
  const evaluation = useMemo(
    () => evaluateLineup(formation, lineup, difficulty, draw.challengeId),
    [formation, lineup, difficulty, draw.challengeId],
  );

  const pickPlayer = (player: Player) => {
    if (pendingPlayer?.id === player.id) {
      setPendingPlayer(null);
      return;
    }
    setPendingPlayer(player);
    pitchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // The placement stays provisional; bring the banner back into view so Continue Draft is visible.
  // Defer to the next frame: the placement re-render replaces the pitch DOM on this tick and would
  // otherwise cancel a smooth scroll started synchronously here.
  const placePending = (slotId: string) => {
    if (pendingPlayer) {
      onPlacePlayer(slotId, pendingPlayer);
      setPendingPlayer(null);
      // Drop the glow class now and re-add it next frame so the one-shot animation
      // replays even when a second player is placed before the first glow finishes.
      setGlowing(false);
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setGlowing(true);
      });
    }
  };

  // Undoing the provisional pick sends the user back to the squad list to try someone else.
  const removeProvisional = () => {
    onRemoveProvisional();
    setPendingPlayer(null);
    squadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Locks the pick, spins the next draw, and lands the user on the new squad list.
  const continueDraft = () => {
    onContinueDraft();
    setPendingPlayer(null);
    squadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="game-page">
      <DraftBanner
        squad={squad}
        rerollsLeft={rerollsLeft}
        canReroll={pendingSlotId === null}
        onChangeTeam={onChangeTeam}
        onChangeYear={onChangeYear}
      />

      {tournamentResult ? (
        <TournamentResultPanel result={tournamentResult} onReplay={onReplay} onNewDraw={onNewDraw} />
      ) : result ? (
        <ResultPanel result={result} onReplay={onReplay} onNewDraw={onNewDraw} />
      ) : (
        <>
          {!evaluation.isComplete ? (
            <button
              className={`continue-draft${glowing ? ' is-glowing' : ''}`}
              type="button"
              disabled={pendingSlotId === null}
              title={pendingSlotId === null ? 'Place a player on the pitch first' : 'Lock this pick and draw the next team'}
              onClick={continueDraft}
              onAnimationEnd={() => setGlowing(false)}
            >
              <ArrowDown size={15} />
              Continue Draft
            </button>
          ) : null}

          <SquadList
            ref={squadRef}
            squad={squad}
            formation={formation}
            lineup={lineup}
            provisionalSlotId={pendingSlotId}
            pendingPlayerId={pendingPlayer?.id ?? null}
            onPickPlayer={pickPlayer}
          />

          <Pitch
            ref={pitchRef}
            formation={formation}
            lineup={lineup}
            pendingPlayer={pendingPlayer}
            provisionalSlotId={pendingSlotId}
            onPlacePending={placePending}
            onRemoveProvisional={removeProvisional}
          />

          <SelectedXI formation={formation} lineup={lineup} evaluation={evaluation} onSimulate={onSimulate} />
        </>
      )}
    </main>
  );
}
