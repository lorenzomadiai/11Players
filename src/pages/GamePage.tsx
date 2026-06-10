import { useMemo, useRef, useState } from 'react';
import DraftBanner from '../components/DraftBanner';
import Pitch from '../components/Pitch';
import ResultPanel from '../components/ResultPanel';
import SelectedXI from '../components/SelectedXI';
import SquadList from '../components/SquadList';
import { getDifficultyById } from '../game-engine/difficulty';
import { evaluateLineup } from '../game-engine/evaluation';
import type { DifficultyId, Formation, GameDraw, LineupSelection, MatchResult, Player, Squad } from '../types/game';

interface GamePageProps {
  draw: GameDraw;
  squad: Squad;
  formation: Formation;
  lineup: LineupSelection;
  difficultyId: DifficultyId;
  exactScoreMode: boolean;
  rerollsLeft: number;
  result: MatchResult | null;
  onPlacePlayer: (slotId: string, player: Player) => void;
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
  difficultyId,
  rerollsLeft,
  result,
  draw,
  onPlacePlayer,
  onSimulate,
  onReplay,
  onNewDraw,
  onChangeTeam,
  onChangeYear,
}: GamePageProps) {
  const [pendingPlayer, setPendingPlayer] = useState<Player | null>(null);
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

  const placePending = (slotId: string) => {
    if (pendingPlayer) {
      onPlacePlayer(slotId, pendingPlayer);
      setPendingPlayer(null);
      squadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <main className="game-page">
      <DraftBanner squad={squad} rerollsLeft={rerollsLeft} onChangeTeam={onChangeTeam} onChangeYear={onChangeYear} />

      {result ? (
        <ResultPanel result={result} onReplay={onReplay} onNewDraw={onNewDraw} />
      ) : (
        <>
          <SquadList
            ref={squadRef}
            squad={squad}
            lineup={lineup}
            pendingPlayerId={pendingPlayer?.id ?? null}
            onPickPlayer={pickPlayer}
          />

          <Pitch
            ref={pitchRef}
            formation={formation}
            lineup={lineup}
            pendingPlayer={pendingPlayer}
            onPlacePending={placePending}
          />

          <SelectedXI formation={formation} lineup={lineup} evaluation={evaluation} onSimulate={onSimulate} />
        </>
      )}
    </main>
  );
}
