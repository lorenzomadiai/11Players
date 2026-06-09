import { Search, Sparkles, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getPlayerSlotFit } from '../game-engine/evaluation';
import { formatPositions, getPositionGroup } from '../game-engine/positions';
import type { FormationSlot, LineupSelection, Player, Squad } from '../types/game';

interface PlayerPoolProps {
  squad: Squad;
  activeSlot: FormationSlot;
  lineup: LineupSelection;
  onSelectPlayer: (playerId: string) => void;
}

type PoolFilter = 'all' | 'goalkeeper' | 'defense' | 'midfield' | 'attack';

const filters: { id: PoolFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'goalkeeper', label: 'GK' },
  { id: 'defense', label: 'DEF' },
  { id: 'midfield', label: 'MID' },
  { id: 'attack', label: 'ATT' },
];

const statPreview = (player: Player) => [
  ['PAC', player.stats.pace],
  ['SHO', player.stats.shooting],
  ['PAS', player.stats.passing],
  ['DEF', player.stats.defense],
];

export default function PlayerPool({ squad, activeSlot, lineup, onSelectPlayer }: PlayerPoolProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<PoolFilter>('all');
  const usedPlayerIds = useMemo(() => new Set(Object.values(lineup).filter(Boolean)), [lineup]);

  const filteredPlayers = squad.players.filter((player) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      !normalizedQuery ||
      player.name.toLowerCase().includes(normalizedQuery) ||
      player.club.toLowerCase().includes(normalizedQuery) ||
      player.role.toLowerCase().includes(normalizedQuery);
    const matchesFilter =
      filter === 'all' || player.positions.some((position) => getPositionGroup(position) === filter);

    return matchesQuery && matchesFilter;
  });

  return (
    <section className="player-pool">
      <div className="section-heading">
        <UserPlus size={18} />
        <div>
          <h2>Player Pool</h2>
          <p>Choosing for {activeSlot.label}</p>
        </div>
      </div>

      <label className="search-box">
        <Search size={17} />
        <input
          type="search"
          placeholder="Search player, club, or role"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="segmented-control segmented-control--compact">
        {filters.map((item) => (
          <button
            key={item.id}
            className={item.id === filter ? 'is-selected' : ''}
            type="button"
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="player-list">
        {filteredPlayers.map((player) => {
          const isUsed = usedPlayerIds.has(player.id);
          const fit = getPlayerSlotFit(activeSlot, player);
          const fitLabel = fit.compatibility >= 0.9 ? 'Great fit' : fit.compatibility >= 0.6 ? 'Usable' : 'Risky';

          return (
            <article key={player.id} className={`player-card ${isUsed ? 'player-card--used' : ''}`}>
              <div className="player-card__rating">
                <strong>{player.rating}</strong>
                <span>{formatPositions(player.positions)}</span>
              </div>
              <div className="player-card__body">
                <div className="player-card__title">
                  <div>
                    <h3>{player.name}</h3>
                    <p>{player.role} - {player.club}</p>
                  </div>
                  {player.isLegend ? (
                    <span className="legend-chip" title="Legend boost">
                      <Sparkles size={13} />
                      Legend
                    </span>
                  ) : null}
                </div>
                <div className="mini-stats" aria-label={`${player.name} key stats`}>
                  {statPreview(player).map(([label, value]) => (
                    <span key={label}>
                      {label} <strong>{value}</strong>
                    </span>
                  ))}
                </div>
                <div className="player-card__footer">
                  <span className={`fit-pill fit-pill--${fitLabel.toLowerCase().replace(' ', '-')}`}>{fitLabel}</span>
                  <button type="button" onClick={() => onSelectPlayer(player.id)} disabled={isUsed}>
                    {isUsed ? 'Selected' : 'Add'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
