import { forwardRef } from 'react';
import type { Formation, LineupSelection, Player } from '../types/game';

interface PitchProps {
  formation: Formation;
  lineup: LineupSelection;
  pendingPlayer: Player | null;
  onPlacePending: (slotId: string) => void;
}

export const isSlotCompatible = (acceptedPositions: string[], player: Player) =>
  player.positions.some((position) => acceptedPositions.includes(position));

const Pitch = forwardRef<HTMLElement, PitchProps>(function Pitch(
  { formation, lineup, pendingPlayer, onPlacePending },
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
          const isTarget = Boolean(
            pendingPlayer && !player && isSlotCompatible(slot.acceptedPositions, pendingPlayer),
          );

          return (
            <div
              key={slot.id}
              className={`slot-card ${player ? 'slot-card--filled' : ''} ${isTarget ? 'slot-card--target' : ''}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
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
