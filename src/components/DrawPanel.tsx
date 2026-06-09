import { CalendarDays, Flag, Goal, Shuffle, Trophy } from 'lucide-react';
import { getChallengeById } from '../game-engine/challenges';
import type { Difficulty, Formation, GameDraw, Squad } from '../types/game';

interface DrawPanelProps {
  draw: GameDraw;
  squad: Squad;
  formation: Formation;
  difficulty: Difficulty;
  exactScoreMode: boolean;
  onNewDraw: () => void;
}

export default function DrawPanel({ draw, squad, formation, difficulty, exactScoreMode, onNewDraw }: DrawPanelProps) {
  const challenge = getChallengeById(draw.challengeId);

  return (
    <aside className="draw-panel">
      <div className="draw-panel__header">
        <div>
          <p className="eyebrow">Random draw</p>
          <h2>{squad.country} {squad.year}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onNewDraw} aria-label="Roll new draw" title="Roll new draw">
          <Shuffle size={18} />
        </button>
      </div>

      <div className="draw-grid">
        <div>
          <Flag size={18} />
          <span>{squad.flag}</span>
          <strong>{squad.country}</strong>
        </div>
        <div>
          <CalendarDays size={18} />
          <span>Edition</span>
          <strong>{squad.editionName}</strong>
        </div>
        <div>
          <Goal size={18} />
          <span>Formation</span>
          <strong>{formation.name}</strong>
        </div>
        <div>
          <Trophy size={18} />
          <span>Difficulty</span>
          <strong>{difficulty.label}</strong>
        </div>
      </div>

      <div className="draw-note">
        <strong>{formation.nickname}</strong>
        <p>{formation.description}</p>
      </div>

      <div className="challenge-card">
        <span>Challenge</span>
        <strong>{challenge.label}</strong>
        <p>{challenge.description}</p>
      </div>

      {exactScoreMode ? (
        <div className="target-mode">
          <strong>7-0 target mode</strong>
          <p>Win exactly 7-0 for the rarest badge. Chasing it adds attacking risk in the simulation.</p>
        </div>
      ) : null}
    </aside>
  );
}
