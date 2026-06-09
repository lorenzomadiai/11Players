import { useEffect, useMemo, useState } from 'react';
import DrawPanel from '../components/DrawPanel';
import EvaluationPanel from '../components/EvaluationPanel';
import Pitch from '../components/Pitch';
import PlayerPool from '../components/PlayerPool';
import ResultPanel from '../components/ResultPanel';
import { getDifficultyById } from '../game-engine/difficulty';
import { evaluateLineup } from '../game-engine/evaluation';
import type { DifficultyId, Formation, GameDraw, LineupSelection, MatchResult, Squad } from '../types/game';

interface GamePageProps {
  draw: GameDraw;
  squad: Squad;
  formation: Formation;
  lineup: LineupSelection;
  difficultyId: DifficultyId;
  exactScoreMode: boolean;
  result: MatchResult | null;
  onSelectPlayer: (slotId: string, playerId: string) => void;
  onClearSlot: (slotId: string) => void;
  onSimulate: () => void;
  onReplay: () => void;
  onNewDraw: () => void;
}

const getNextEmptySlot = (formation: Formation, lineup: LineupSelection, currentSlotId: string) => {
  const currentIndex = formation.slots.findIndex((slot) => slot.id === currentSlotId);
  const orderedSlots = [...formation.slots.slice(currentIndex + 1), ...formation.slots.slice(0, currentIndex + 1)];
  return orderedSlots.find((slot) => !lineup[slot.id])?.id ?? currentSlotId;
};

export default function GamePage({
  draw,
  squad,
  formation,
  lineup,
  difficultyId,
  exactScoreMode,
  result,
  onSelectPlayer,
  onClearSlot,
  onSimulate,
  onReplay,
  onNewDraw,
}: GamePageProps) {
  const [activeSlotId, setActiveSlotId] = useState(formation.slots[0].id);
  const difficulty = getDifficultyById(difficultyId);
  const evaluation = useMemo(
    () => evaluateLineup(squad, formation, lineup, difficulty, draw.challengeId),
    [squad, formation, lineup, difficulty, draw.challengeId],
  );
  const activeSlot = formation.slots.find((slot) => slot.id === activeSlotId) ?? formation.slots[0];

  useEffect(() => {
    if (!formation.slots.some((slot) => slot.id === activeSlotId)) {
      setActiveSlotId(formation.slots[0].id);
    }
  }, [activeSlotId, formation]);

  const handlePlayerSelect = (playerId: string) => {
    onSelectPlayer(activeSlot.id, playerId);
    const optimisticLineup = { ...lineup, [activeSlot.id]: playerId };
    setActiveSlotId(getNextEmptySlot(formation, optimisticLineup, activeSlot.id));
  };

  return (
    <main className="game-page">
      <DrawPanel
        draw={draw}
        squad={squad}
        formation={formation}
        difficulty={difficulty}
        exactScoreMode={exactScoreMode}
        onNewDraw={onNewDraw}
      />

      <div className="game-stage">
        <Pitch
          formation={formation}
          squad={squad}
          lineup={lineup}
          activeSlotId={activeSlot.id}
          slotReports={evaluation.slotReports}
          onSlotSelect={setActiveSlotId}
          onClearSlot={onClearSlot}
        />

        {result ? (
          <ResultPanel result={result} squad={squad} onReplay={onReplay} onNewDraw={onNewDraw} />
        ) : (
          <PlayerPool squad={squad} activeSlot={activeSlot} lineup={lineup} onSelectPlayer={handlePlayerSelect} />
        )}
      </div>

      <EvaluationPanel evaluation={evaluation} onSimulate={onSimulate} />
    </main>
  );
}
