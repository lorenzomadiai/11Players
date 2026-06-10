import { forwardRef } from 'react';
import { X } from 'lucide-react';
import { playerFitsSlot } from '../game-engine/positions';
import type { Formation, LineupSelection, Player } from '../types/game';

interface PitchProps {
  formation: Formation;
  lineup: LineupSelection;
  pendingPlayer: Player | null;
  provisionalSlotId: string | null;
  onPlacePending: (slotId: string) => void;
  onRemoveProvisional: () => void;
}

const Pitch = forwardRef<HTMLElement, PitchProps>(function Pitch(
  { formation, lineup, pendingPlayer, provisionalSlotId, onPlacePending, onRemoveProvisional },
  ref,
) {
  return (
    <section className="pitch-shell" aria-label={`${formation.name} pitch`} ref={ref}>
      <div className="pitch-meta">
        <h2>{formation.name}</h2>
        <span>
          {pendingPlayer ? `Place ${pendingPlayer.name} on a highlighted spot` : 'Pick a player from the squad above'}
        </span>
      </div>

      <div className="pitch">
        <div className="pitch__center-circle" />
        <div className="pitch__box pitch__box--top" />
        <div className="pitch__box pitch__box--bottom" />
        {formation.slots.map((slot) => {
          const player = lineup[slot.id] ?? null;
          // The provisional slot can be re-targeted: placing there swaps the try-out player.
          const treatAsEmpty = !player || slot.id === provisionalSlotId;
          const isTarget = Boolean(pendingPlayer && treatAsEmpty && playerFitsSlot(slot, pendingPlayer));
          const isProvisional = Boolean(player && slot.id === provisionalSlotId);

          return (
            <div
              key={slot.id}
              className={`slot-card ${player ? 'slot-card--filled' : ''} ${isTarget ? 'slot-card--target' : ''} ${
                isProvisional ? 'slot-card--provisional' : ''
              }`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              {isProvisional ? (
                <button
                  type="button"
                  className="slot-card__undo"
                  aria-label={`Remove ${player?.name}`}
                  title="Try another player instead"
                  onClick={onRemoveProvisional}
                >
                  <X size={13} />
                </button>
              ) : null}
              <button
                type="button"
                disabled={!isTarget}
                onClick={() => {
                  if (isTarget) {
                    onPlacePending(slot.id);
                  }
                }}
                title={isTarget ? `Place at ${slot.label}` : slot.label}
              >
                <span className="slot-card__position">{slot.label}</span>
                {player ? (
                  <>
                    <strong>{player.name}</strong>
                    <small>{player.rating}</small>
                  </>
                ) : (
                  <strong className="slot-card__empty">{isTarget ? 'Place here' : 'Empty'}</strong>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
});

export default Pitch;
