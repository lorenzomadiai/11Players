import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pitch from '../Pitch';
import { createEmptyLineup } from '../../game-engine/formations';
import { brazil433Lineup, requireFormation, requirePlayer, requireSquad } from '../../test/fixtures';

describe('Pitch', () => {
  it('renders selected players on their slots', () => {
    const formation = requireFormation();
    const lineup = brazil433Lineup();

    render(
      <Pitch
        formation={formation}
        lineup={lineup}
        pendingPlayer={null}
        provisionalSlotId={null}
        onPlacePending={vi.fn()}
        onRemoveProvisional={vi.fn()}
      />,
    );

    expect(screen.getByText('Cafu')).toBeInTheDocument();
    expect(screen.getByTitle('RB')).toBeDisabled();
  });

  it('places a pending player on a compatible open slot', async () => {
    const user = userEvent.setup();
    const squad = requireSquad();
    const formation = requireFormation();
    const onPlacePending = vi.fn();

    render(
      <Pitch
        formation={formation}
        lineup={createEmptyLineup(formation)}
        pendingPlayer={requirePlayer(squad, 'bra-2002-cafu')}
        provisionalSlotId={null}
        onPlacePending={onPlacePending}
        onRemoveProvisional={vi.fn()}
      />,
    );

    await user.click(screen.getByTitle('Place at RB'));

    expect(onPlacePending).toHaveBeenCalledWith('rb');
  });

  it('allows removing only the provisional pick', async () => {
    const user = userEvent.setup();
    const squad = requireSquad();
    const formation = requireFormation();
    const lineup = {
      ...createEmptyLineup(formation),
      rb: requirePlayer(squad, 'bra-2002-cafu'),
    };
    const onRemoveProvisional = vi.fn();

    render(
      <Pitch
        formation={formation}
        lineup={lineup}
        pendingPlayer={null}
        provisionalSlotId="rb"
        onPlacePending={vi.fn()}
        onRemoveProvisional={onRemoveProvisional}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Remove Cafu' }));

    expect(onRemoveProvisional).toHaveBeenCalledTimes(1);
  });
});
