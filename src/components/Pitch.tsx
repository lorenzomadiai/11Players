import { Shirt, X } from 'lucide-react';
import type { Formation, LineupSelection, Player, SlotReport, Squad } from '../types/game';

interface PitchProps {
  formation: Formation;
  squad: Squad;
  lineup: LineupSelection;
  activeSlotId: string;
  slotReports: SlotReport[];
  onSlotSelect: (slotId: string) => void;
  onClearSlot: (slotId: string) => void;
}

export default function Pitch({
  formation,
  squad,
  lineup,
  activeSlotId,
  slotReports,
  onSlotSelect,
  onClearSlot,
}: PitchProps) {
  const reportBySlot = Object.fromEntries(slotReports.map((report) => [report.slotId, report]));

  const getPlayer = (slotId: string): Player | undefined => {
    const playerId = lineup[slotId];
    return squad.players.find((player) => player.id === playerId);
  };

  return (
    <section className="pitch-shell" aria-label={`${formation.name} pitch`}>
      <div className="pitch-meta">
        <div>
          <p className="eyebrow">Formation</p>
          <h2>{formation.name}</h2>
        </div>
        <span>{formation.nickname}</span>
      </div>

      <div className="pitch">
        <div className="pitch__center-circle" />
        <div className="pitch__box pitch__box--top" />
        <div className="pitch__box pitch__box--bottom" />
        {formation.slots.map((slot) => {
          const player = getPlayer(slot.id);
          const report = reportBySlot[slot.id];
          const isActive = slot.id === activeSlotId;
          const fitClass = player && report?.compatibility < 0.6 ? 'slot-card--warning' : '';

          return (
            <div
              key={slot.id}
              className={`slot-card ${isActive ? 'slot-card--active' : ''} ${player ? 'slot-card--filled' : ''} ${fitClass}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              <button type="button" onClick={() => onSlotSelect(slot.id)} title={`Select ${slot.label}`}>
                <span className="slot-card__position">{slot.label}</span>
                {player ? (
                  <>
                    <strong>{player.name}</strong>
                    <small>#{player.shirtNumber} - {player.rating}</small>
                  </>
                ) : (
                  <>
                    <Shirt size={20} />
                    <strong>Pick player</strong>
                  </>
                )}
              </button>
              {player ? (
                <button
                  className="slot-card__clear"
                  type="button"
                  onClick={() => onClearSlot(slot.id)}
                  aria-label={`Clear ${slot.label}`}
                  title={`Clear ${slot.label}`}
                >
                  <X size={13} />
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
