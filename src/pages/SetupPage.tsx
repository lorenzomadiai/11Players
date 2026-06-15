import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { formations } from '../game-engine/formations';
import type { TeamStyle } from '../types/game';

interface SetupPageProps {
  initialStyle: TeamStyle;
  onDraft: (formationId: string, style: TeamStyle) => void;
}

const styles: { id: TeamStyle; label: string }[] = [
  { id: 'defensive', label: 'Defensive' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'attacking', label: 'Attacking' },
];

export default function SetupPage({ initialStyle, onDraft }: SetupPageProps) {
  const [formationId, setFormationId] = useState(formations[0].id);
  const [style, setStyle] = useState<TeamStyle>(initialStyle);
  const formation = formations.find((item) => item.id === formationId) ?? formations[0];

  return (
    <main className="setup-page">
      <section className="setup-controls">
        <div className="setup-field">
          <span className="setup-field__label">Formation</span>
          <div className="segmented-control">
            {formations.map((item) => (
              <button
                key={item.id}
                className={item.id === formationId ? 'is-selected' : ''}
                type="button"
                onClick={() => setFormationId(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        <div className="setup-field">
          <span className="setup-field__label">Style</span>
          <div className="segmented-control">
            {styles.map((item) => (
              <button
                key={item.id}
                className={item.id === style ? 'is-selected' : ''}
                type="button"
                onClick={() => setStyle(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="setup-pitch" aria-label={`${formation.name} preview`}>
        {formation.slots.map((slot) => (
          <span key={slot.id} style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
            {slot.label}
          </span>
        ))}
      </div>

      <button className="primary-action setup-draft" type="button" onClick={() => onDraft(formationId, style)}>
        <ClipboardList size={18} />
        Draft
      </button>
    </main>
  );
}
