import { Play } from 'lucide-react';
import type { Formation, FormationSlot, LineupSelection, Player, TeamEvaluation } from '../types/game';

interface SelectedXIProps {
  formation: Formation;
  lineup: LineupSelection;
  evaluation: TeamEvaluation;
  onSimulate: () => void;
}

export default function SelectedXI({ formation, lineup, evaluation, onSimulate }: SelectedXIProps) {
  const picks = formation.slots
    .map((slot) => {
      const player = lineup[slot.id];
      return player ? { slot, player } : null;
    })
    .filter((pick): pick is { slot: FormationSlot; player: Player } => pick !== null);

  const hasDefense = picks.some(({ slot }) => slot.roleGroup === 'goalkeeper' || slot.roleGroup === 'defense');
  const hasAttack = picks.some(({ slot }) => slot.roleGroup === 'attack');
  const attackScore = hasAttack ? Math.round(evaluation.attack) : null;
  const defenseScore = hasDefense ? Math.round(evaluation.defense) : null;

  return (
    <section className="selected-xi" aria-label="Your selected XI">
      <div className="selected-xi__head">
        <h2>
          Your XI <span>{picks.length}/11</span>
        </h2>
        <div className="selected-xi__meters">
          <span>
            ATT <strong>{attackScore ?? '–'}</strong>
          </span>
          <span>
            DEF <strong>{defenseScore ?? '–'}</strong>
          </span>
        </div>
      </div>

      {picks.length === 0 ? (
        <p className="selected-xi__empty">No players picked yet. Your selections will collect here.</p>
      ) : (
        <div className="selected-xi__scroll">
          {picks.map(({ slot, player }) => (
            <div key={slot.id} className="selected-xi__row">
              <span className="selected-xi__slot">{slot.label}</span>
              <span className="selected-xi__name">{player.name}</span>
              <span className="selected-xi__origin">
                {player.countryCode} {player.worldCupYear}
              </span>
              <span className="selected-xi__rating">{player.rating}</span>
            </div>
          ))}
        </div>
      )}

      <button
        className="primary-action selected-xi__kickoff"
        type="button"
        disabled={!evaluation.isComplete}
        onClick={onSimulate}
      >
        <Play size={17} />
        {evaluation.isComplete ? 'Kick Off' : `Kick Off (${picks.length}/11)`}
      </button>
    </section>
  );
}
