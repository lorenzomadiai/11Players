import { AlertTriangle, BadgeCheck, Brain, LineChart } from 'lucide-react';
import type { TeamEvaluation } from '../types/game';
import AchievementBadges from './AchievementBadges';
import StatBar from './StatBar';

interface EvaluationPanelProps {
  evaluation: TeamEvaluation;
  onSimulate: () => void;
}

export default function EvaluationPanel({ evaluation, onSimulate }: EvaluationPanelProps) {
  return (
    <aside className="evaluation-panel">
      <div className="section-heading">
        <LineChart size={18} />
        <div>
          <h2>Team Check</h2>
          <p>{evaluation.filledSlots}/11 positions filled</p>
        </div>
      </div>

      <div className="overall-meter">
        <span>Overall</span>
        <strong>{Math.round(evaluation.overall)}</strong>
      </div>

      <div className="stats-stack">
        <StatBar label="Attack" value={evaluation.attack} tone="red" />
        <StatBar label="Midfield" value={evaluation.midfield} tone="blue" />
        <StatBar label="Defense" value={evaluation.defense} tone="green" />
        <StatBar label="Chemistry" value={evaluation.chemistry} tone="gold" />
        <StatBar label="Tactical Fit" value={evaluation.tacticalFit} tone="blue" />
        <StatBar label="Star Power" value={evaluation.starPower} tone="gold" />
      </div>

      <div className={`challenge-status ${evaluation.challenge.passed ? 'challenge-status--passed' : ''}`}>
        <BadgeCheck size={18} />
        <div>
          <strong>{evaluation.challenge.label}</strong>
          {evaluation.challenge.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </div>

      {evaluation.warnings.length > 0 ? (
        <div className="warning-list">
          {evaluation.warnings.map((warning) => (
            <p key={warning}>
              <AlertTriangle size={15} />
              {warning}
            </p>
          ))}
        </div>
      ) : (
        <p className="success-note">
          <Brain size={15} />
          The XI is legal and ready for the simulator.
        </p>
      )}

      <AchievementBadges achievements={evaluation.achievements} />

      <button className="primary-action" type="button" onClick={onSimulate} disabled={!evaluation.isComplete}>
        Simulate Match
      </button>
    </aside>
  );
}
