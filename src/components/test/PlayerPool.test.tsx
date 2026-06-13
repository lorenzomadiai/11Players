import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import PlayerPool from '../PlayerPool';
import { createEmptyLineup } from '../../game-engine/formations';
import { requireFormation, requireSquad } from '../../test/fixtures';

const renderPlayerPool = (overrides: Partial<React.ComponentProps<typeof PlayerPool>> = {}) => {
  const squad = requireSquad();
  const formation = requireFormation();
  const activeSlot = formation.slots.find((slot) => slot.id === 'rb')!;

  return render(
    <PlayerPool
      squad={squad}
      activeSlot={activeSlot}
      lineup={createEmptyLineup(formation)}
      onSelectPlayer={vi.fn()}
      {...overrides}
    />,
  );
};

describe('PlayerPool', () => {
  it('labels strong slot fits and submits the selected player id', async () => {
    const user = userEvent.setup();
    const onSelectPlayer = vi.fn();

    renderPlayerPool({ onSelectPlayer });

    const cafuCard = screen.getByRole('heading', { name: 'Cafu' }).closest('article');
    expect(cafuCard).not.toBeNull();
    expect(within(cafuCard!).getByText('Great fit')).toBeInTheDocument();

    await user.click(within(cafuCard!).getByRole('button', { name: 'Add' }));

    expect(onSelectPlayer).toHaveBeenCalledWith('bra-2002-cafu');
  });

  it('disables already selected players', () => {
    const formation = requireFormation();
    const lineup = {
      ...createEmptyLineup(formation),
      rb: 'bra-2002-cafu',
    };

    renderPlayerPool({ lineup });

    const cafuCard = screen.getByRole('heading', { name: 'Cafu' }).closest('article');

    expect(within(cafuCard!).getByRole('button', { name: 'Selected' })).toBeDisabled();
  });

  it('filters players by search query', async () => {
    const user = userEvent.setup();

    renderPlayerPool();

    await user.type(screen.getByRole('searchbox'), 'inter');

    expect(screen.getByRole('heading', { name: 'Ronaldo' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Cafu' })).not.toBeInTheDocument();
  });
});

