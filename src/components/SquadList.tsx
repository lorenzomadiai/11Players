import { Check } from 'lucide-react';
import { forwardRef, useEffect, useMemo, useRef } from 'react';
import { getPositionGroup } from '../game-engine/positions';
import type { LineupSelection, Player, RoleGroup, Squad } from '../types/game';

interface SquadListProps {
  squad: Squad;
  lineup: LineupSelection;
  pendingPlayerId: string | null;
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
  { squad, lineup, pendingPlayerId, onPickPlayer },
  ref,
) {
  const usedPlayerIds = useMemo(
    () => new Set(Object.values(lineup).flatMap((player) => (player ? [player.id] : []))),
    [lineup],
  );
  const players = useMemo(() => sortSquad(squad.players), [squad]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [squad.id]);

  return (
    <section className="squad-list" aria-label={`${squad.country} ${squad.year} squad`} ref={ref}>
      <div className="squad-list__head">
        <h2>Squad</h2>
        <span>Pick one player for your XI, or skip the draw above</span>
      </div>

      <div className="squad-list__scroll" ref={scrollRef}>
        {players.map((player) => {
          const isUsed = usedPlayerIds.has(player.id);
          const isPending = player.id === pendingPlayerId;
          const [primary, ...alternates] = player.positions;

          return (
            <button
              key={player.id}
              className={`squad-row ${isUsed ? 'squad-row--used' : ''} ${isPending ? 'squad-row--pending' : ''}`}
              type="button"
              disabled={isUsed}
              onClick={() => onPickPlayer(player)}
            >
              <span className="squad-row__number">{player.shirtNumber}</span>
              <span className="squad-row__name">{player.name}</span>
              <span className="squad-row__positions">
                <strong>{primary}</strong>
                {alternates.length > 0 ? <small>{alternates.join(' ')}</small> : null}
              </span>
              <span className="squad-row__rating">{isUsed ? <Check size={15} /> : player.rating}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
});

export default SquadList;
