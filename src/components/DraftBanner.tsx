import { useEffect, useState } from 'react';
import { CalendarDays, Shuffle } from 'lucide-react';
import { squads } from '../data/mockData';
import type { Squad } from '../types/game';

interface DraftBannerProps {
  squad: Squad;
  rerollsLeft: number;
  /** Skipping is disabled while a provisional pick from this draw sits on the pitch. */
  canReroll: boolean;
  onRevealStateChange?: (state: DraftRevealState) => void;
  onChangeTeam: () => void;
  onChangeYear: () => void;
}

const SPIN_TICKS = 14;
const SPIN_INTERVAL_MS = 75;
const REEL_PLACEHOLDER = 'Drawing...';

export type DraftRevealState = 'rolling' | 'revealed';

const labelOf = (squad: Squad) => `${squad.country} ${squad.year}`;

export default function DraftBanner({
  squad,
  rerollsLeft,
  canReroll,
  onRevealStateChange,
  onChangeTeam,
  onChangeYear,
}: DraftBannerProps) {
  const [display, setDisplay] = useState(REEL_PLACEHOLDER);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const finalLabel = labelOf(squad);
    const reel = squads.map(labelOf);
    let tick = 0;

    // The banner owns the reveal clock; parent screens use this signal to keep
    // player names sealed until the draw animation has genuinely finished.
    onRevealStateChange?.('rolling');
    setDisplay(REEL_PLACEHOLDER);
    setSpinning(true);

    const interval = window.setInterval(() => {
      tick += 1;
      if (tick >= SPIN_TICKS) {
        window.clearInterval(interval);
        setDisplay(finalLabel);
        setSpinning(false);
        onRevealStateChange?.('revealed');
        return;
      }
      setDisplay(reel[tick % reel.length]);
    }, SPIN_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [onRevealStateChange, squad.id]);

  return (
    <section className="draft-banner" aria-label="Drawn team">
      <div className="draft-banner__draw">
        <span className="draft-banner__label">Your draw</span>
        <strong className={`draft-banner__reel ${spinning ? 'is-spinning' : ''}`}>{display}</strong>
      </div>

      <div className="draft-banner__actions">
        <button
          type="button"
          onClick={onChangeTeam}
          disabled={spinning || rerollsLeft <= 0 || !canReroll}
          title={!canReroll ? 'Remove your provisional pick first' : undefined}
        >
          <Shuffle size={15} />
          Change team
        </button>
        <button
          type="button"
          onClick={onChangeYear}
          disabled={spinning || rerollsLeft <= 0 || !canReroll}
          title={!canReroll ? 'Remove your provisional pick first' : undefined}
        >
          <CalendarDays size={15} />
          Change year
        </button>
        <span className="draft-banner__counter">{rerollsLeft} left</span>
      </div>
    </section>
  );
}
