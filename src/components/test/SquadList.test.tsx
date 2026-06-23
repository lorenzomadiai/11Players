import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SquadList from '../SquadList';
import { createEmptyLineup } from '../../game-engine/formations';
import { requireFormation, requirePlayer, requireSquad } from '../../test/fixtures';

const renderSquadList = (overrides: Partial<React.ComponentProps<typeof SquadList>> = {}) => {
  const squad = requireSquad();
  const formation = requireFormation();

  return {
    squad,
    formation,
    ...render(
      <SquadList
        squad={squad}
        formation={formation}
        lineup={createEmptyLineup(formation)}
        provisionalSlotId={null}
        pendingPlayerId={null}
        onPickPlayer={vi.fn()}
        {...overrides}
      />,
    ),
  };
};

describe('SquadList', () => {
  it('submits the selected player object', async () => {
    const user = userEvent.setup();
    const onPickPlayer = vi.fn();
    const { squad } = renderSquadList({ onPickPlayer });
    const cafu = requirePlayer(squad, 'bra-2002-cafu');

    await user.click(screen.getByRole('button', { name: /Cafu/i }));

    expect(onPickPlayer).toHaveBeenCalledWith(cafu);
  });

  it('disables already selected players', () => {
    const squad = requireSquad();
    const formation = requireFormation();
    const lineup = {
      ...createEmptyLineup(formation),
      rb: requirePlayer(squad, 'bra-2002-cafu'),
    };

    renderSquadList({ lineup });

    expect(screen.getByRole('button', { name: /Cafu/i })).toBeDisabled();
  });

  it('marks the currently pending player', () => {
    renderSquadList({ pendingPlayerId: 'bra-2002-cafu' });

    expect(screen.getByRole('button', { name: /Cafu/i })).toHaveClass('squad-row--pending');
    expect(screen.getByRole('button', { name: /Cafu/i })).not.toBeDisabled();
  });
});
