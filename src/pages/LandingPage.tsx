import { Dice5, Goal, Play, Shield, Sparkles, Target } from 'lucide-react';
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
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-copy">
          <p className="eyebrow">Roll history. Build the XI. Survive the simulation.</p>
          <h2>Draft an 11-player World Cup lineup from one nation, one edition, and one tactical shape.</h2>
          <p>
            Each run draws a national team, tournament year, formation, and side challenge. Pick eligible players from
            that squad, chase chemistry bonuses, and see whether the simulator loves your football logic.
          </p>
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

      <section className="landing-grid">
        <article>
          <Dice5 size={21} />
          <h3>Random Draws</h3>
          <p>Countries, World Cup editions, formations, and challenges combine into fresh squad-building puzzles.</p>
        </article>
        <article>
          <Sparkles size={21} />
          <h3>Legend Boosts</h3>
          <p>Iconic players can tilt tight simulations, but challenge rules may make you leave them out.</p>
        </article>
        <article>
          <Shield size={21} />
          <h3>Chemistry Checks</h3>
          <p>Same club links, tournament-era cohesion, and position compatibility shape the final score.</p>
        </article>
        <article>
          <Goal size={21} />
          <h3>Match Feedback</h3>
          <p>Results explain attack, midfield, defense, tactical fit, randomness, and post-match comedy.</p>
        </article>
      </section>

      <DifficultySelector difficultyId={difficultyId} onChange={onDifficultyChange} />
    </main>
  );
}
