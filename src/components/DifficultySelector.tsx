import { ShieldCheck } from 'lucide-react';
import { difficulties } from '../game-engine/difficulty';
import type { DifficultyId } from '../types/game';

interface DifficultySelectorProps {
  difficultyId: DifficultyId;
  onChange: (difficultyId: DifficultyId) => void;
}

export default function DifficultySelector({ difficultyId, onChange }: DifficultySelectorProps) {
  const selected = difficulties.find((difficulty) => difficulty.id === difficultyId);

  return (
    <div className="difficulty-inline" aria-label="Difficulty level">
      <span className="difficulty-inline__label">
        <ShieldCheck size={15} />
        Difficulty
      </span>
      <div className="segmented-control">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty.id}
            className={difficulty.id === difficultyId ? 'is-selected' : ''}
            type="button"
            onClick={() => onChange(difficulty.id)}
            title={difficulty.description}
          >
            {difficulty.label}
          </button>
        ))}
      </div>
      <p className="difficulty-inline__hint">{selected?.description}</p>
    </div>
  );
}
