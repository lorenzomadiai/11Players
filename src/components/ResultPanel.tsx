import { RefreshCw, Shuffle, Trophy } from 'lucide-react';
import type { MatchResult, Squad } from '../types/game';
import AchievementBadges from './AchievementBadges';
import StatBar from './StatBar';

interface ResultPanelProps {
  result: MatchResult;
  squad: Squad;
  onReplay: () => void;
  onNewDraw: () => void;
}

export default function ResultPanel({ result, squad, onReplay, onNewDraw }: ResultPanelProps) {
  return (
    <section className="result-panel">
      <div className="result-score">
        <div>
          <span>{squad.country} XI</span>
          <strong>{result.teamGoals}</strong>
        </div>
        <span>vs</span>
        <div>
          <span>{result.opponentName}</span>
          <strong>{result.opponentGoals}</strong>
        </div>
      </div>

      <div className="result-copy">
        <p className="eyebrow">{result.outcome === 'win' ? 'Simulation won' : result.outcome === 'draw' ? 'Simulation drawn' : 'Simulation lost'}</p>
        <h2>{result.summary}</h2>
        <p>{result.commentary}</p>
      </div>

      <div className="result-layout">
        <div className="result-reasons">
          <div className="section-heading">
            <Trophy size={18} />
            <h3>Why it happened</h3>
          </div>
          {result.reasons.map((reason) => (
            <p key={reason}>{reason}</p>
          ))}
        </div>

        <div className="stats-stack">
          <StatBar label="Attack" value={result.stats.attack} tone="red" />
          <StatBar label="Midfield" value={result.stats.midfield} tone="blue" />
          <StatBar label="Defense" value={result.stats.defense} tone="green" />
          <StatBar label="Chemistry" value={result.stats.chemistry} tone="gold" />
          <StatBar label="Random Swing" value={50 + result.stats.randomSwing * 2} tone={result.stats.randomSwing >= 0 ? 'green' : 'red'} />
          <StatBar label="Opponent" value={result.stats.opponentStrength} tone="blue" />
        </div>
      </div>

      <AchievementBadges achievements={result.achievements} />

      <div className="result-actions">
        <button type="button" onClick={onReplay}>
          <RefreshCw size={17} />
          Replay Draw
        </button>
        <button type="button" onClick={onNewDraw}>
          <Shuffle size={17} />
          New Draw
        </button>
      </div>
    </section>
  );
}
