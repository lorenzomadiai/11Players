import { ShieldCheck } from 'lucide-react';
import { difficulties } from '../game-engine/difficulty';
import type { DifficultyId } from '../types/game';

interface DifficultySelectorProps {
  difficultyId: DifficultyId;
  onChange: (difficultyId: DifficultyId) => void;
}

export default function DifficultySelector({ difficultyId, onChange }: DifficultySelectorProps) {
  return (
    <section className="difficulty-panel" aria-label="Difficulty level">
      <div className="section-heading">
        <ShieldCheck size={18} />
        <h2>Difficulty</h2>
      </div>
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
      <p>{difficulties.find((difficulty) => difficulty.id === difficultyId)?.description}</p>
    </section>
  );
}
