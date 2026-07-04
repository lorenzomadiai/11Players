import { Check } from 'lucide-react';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { getPositionGroup, hasOpenCompatibleSlot } from '../game-engine/positions';
import type { Formation, LineupSelection, Player, RoleGroup, Squad } from '../types/game';

interface SquadListProps {
  squad: Squad;
  formation: Formation;
  lineup: LineupSelection;
  provisionalSlotId: string | null;
  pendingPlayerId: string | null;
  isRevealed?: boolean;
  onPickPlayer: (player: Player) => void;
}

const groupOrder: RoleGroup[] = ['goalkeeper', 'defense', 'midfield', 'attack'];

const sortSquad = (players: Player[]) =>
  [...players].sort((a, b) => {
    const groupDiff =
      groupOrder.indexOf(getPositionGroup(a.positions[0])) - groupOrder.indexOf(getPositionGroup(b.positions[0]));
    if (groupDiff !== 0) {
      return groupDiff;
    }
    return b.rating - a.rating;
  });

const SquadList = forwardRef<HTMLElement, SquadListProps>(function SquadList(
  { squad, formation, lineup, provisionalSlotId, pendingPlayerId, isRevealed = true, onPickPlayer },
  ref,
) {
  const usedPlayerIds = useMemo(
    () => new Set(Object.values(lineup).flatMap((player) => (player ? [player.id] : []))),
    [lineup],
  );

  // Picking a teammate would swap with the provisional pick, so treat that slot as still open.
  const openLineup = useMemo(
    () => (provisionalSlotId ? { ...lineup, [provisionalSlotId]: null } : lineup),
    [lineup, provisionalSlotId],
  );
  const players = useMemo(() => sortSquad(squad.players), [squad]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo?.({ top: 0 });
  }, [squad.id]);

  if (!isRevealed) {
    return (
      <section className="squad-list squad-list--revealing" aria-label="Squad reveal pending" aria-busy="true" ref={ref}>
        <div className="squad-list__head">
          <h2>Squad</h2>
          <span>Awaiting final draw</span>
        </div>

        <div className="squad-list__reveal" aria-live="polite">
          <strong>Scouting files sealed</strong>
          <span>Lineup cards opening next</span>
          {/* These rows preserve the squad panel rhythm without exposing names,
              so the banner reveal remains the first real team signal. */}
          <div className="squad-list__skeleton" aria-hidden="true">
            {Array.from({ length: 8 }, (_, index) => (
              <span key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="squad-list" aria-label={`${squad.country} ${squad.year} squad`} ref={ref}>
      <div className="squad-list__head">
        <h2>Squad</h2>
        <span>Pick one player for your XI, or skip the draw above</span>
      </div>

      <div className="squad-list__scroll" ref={scrollRef}>
        {players.map((player) => {
          const isUsed = usedPlayerIds.has(player.id);
          const isBlocked = !isUsed && !hasOpenCompatibleSlot(formation, openLineup, player);
          const isPending = player.id === pendingPlayerId;
          const [primary, ...alternates] = player.positions;

          return (
            <button
              key={player.id}
              className={`squad-row ${isUsed ? 'squad-row--used' : ''} ${isBlocked ? 'squad-row--blocked' : ''} ${
                isPending ? 'squad-row--pending' : ''
              }`}
              type="button"
              disabled={isUsed || isBlocked}
              title={isBlocked ? 'No compatible position left in your formation' : undefined}
              onClick={() => onPickPlayer(player)}
            >
              <span className="squad-row__number">{player.shirtNumber}</span>
              <span className="squad-row__name">{player.name}</span>
              <span className="squad-row__positions">
                <strong>{primary}</strong>
                {alternates.length > 0 ? <small>{alternates.join(' ')}</small> : null}
              </span>
              <span className="squad-row__rating">
                {isUsed ? <Check size={15} /> : isBlocked ? '—' : player.rating}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default SquadList;
