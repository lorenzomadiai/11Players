import { useEffect, useRef, useState } from 'react';
import { Dice5, Goal, Info, Play, Shield, Sparkles, Target, X } from 'lucide-react';
import DifficultySelector from '../components/DifficultySelector';
import type { DifficultyId } from '../types/game';

interface LandingPageProps {
  difficultyId: DifficultyId;
  exactScoreMode: boolean;
  onDifficultyChange: (difficultyId: DifficultyId) => void;
  onExactScoreModeChange: (enabled: boolean) => void;
  onStart: () => void;
}

const previewSlots = [
  { label: 'GK', x: 50, y: 88 },
  { label: 'LB', x: 18, y: 72 },
  { label: 'CB', x: 38, y: 74 },
  { label: 'CB', x: 62, y: 74 },
  { label: 'RB', x: 82, y: 72 },
  { label: 'DM', x: 50, y: 58 },
  { label: 'CM', x: 32, y: 45 },
  { label: 'CM', x: 68, y: 45 },
  { label: 'LW', x: 18, y: 24 },
  { label: 'ST', x: 50, y: 16 },
  { label: 'RW', x: 82, y: 24 },
];

export default function LandingPage({
  difficultyId,
  exactScoreMode,
  onDifficultyChange,
  onExactScoreModeChange,
  onStart,
}: LandingPageProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!infoOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setInfoOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [infoOpen]);

  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Roll history. Build the XI. Survive the simulation.</p>
          <h2>
            Draft an 11-player World Cup lineup from one nation, one edition, and one tactical shape.
            <span className="info-popover" ref={infoRef}>
              <button
                className="info-button"
                type="button"
                aria-label="How a run works"
                aria-expanded={infoOpen}
                onClick={() => setInfoOpen((open) => !open)}
              >
                <Info size={15} />
              </button>
              {infoOpen && (
                <span className="info-popover__bubble" role="note">
                  <button
                    className="info-popover__close"
                    type="button"
                    aria-label="Close"
                    onClick={() => setInfoOpen(false)}
                  >
                    <X size={13} />
                  </button>
                  Each run draws a national team, tournament year, formation, and side challenge. Pick eligible
                  players from that squad, chase chemistry bonuses, and see whether the simulator loves your football
                  logic.
                </span>
              )}
            </span>
          </h2>
          <DifficultySelector difficultyId={difficultyId} onChange={onDifficultyChange} />
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={onStart}>
              <Play size={18} />
              Start Game
            </button>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={exactScoreMode}
                onChange={(event) => onExactScoreModeChange(event.target.checked)}
              />
              <span>
                <Target size={16} />
                Try to win exactly 7-0
              </span>
            </label>
          </div>
        </div>

        <div className="hero-pitch" aria-hidden="true">
          <div className="hero-pitch__line hero-pitch__line--top" />
          <div className="hero-pitch__line hero-pitch__line--bottom" />
          {previewSlots.map((slot, index) => (
            <span key={`${slot.label}-${index}`} style={{ left: `${slot.x}%`, top: `${slot.y}%` }}>
              {slot.label}
            </span>
          ))}
        </div>
      </section>

      <section className="feature-strip" aria-label="Game features">
        <article>
          <Dice5 size={16} />
          <div>
            <h3>Random Draws</h3>
            <p>Countries, editions, formations, and challenges combine into fresh puzzles.</p>
          </div>
        </article>
        <article>
          <Sparkles size={16} />
          <div>
            <h3>Legend Boosts</h3>
            <p>Iconic players tilt tight simulations, but rules may rule them out.</p>
          </div>
        </article>
        <article>
          <Shield size={16} />
          <div>
            <h3>Chemistry Checks</h3>
            <p>Club links, era cohesion, and position fit shape the final score.</p>
          </div>
        </article>
        <article>
          <Goal size={16} />
          <div>
            <h3>Match Feedback</h3>
            <p>Results explain attack, defense, tactics, luck, and post-match comedy.</p>
          </div>
        </article>
      </section>
    </main>
  );
}
