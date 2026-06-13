import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Pitch from '../Pitch';
import { evaluateLineup } from '../../game-engine/evaluation';
import { brazil433Lineup, requireDifficulty, requireFormation, requireSquad } from '../../test/fixtures';

describe('Pitch', () => {
  it('renders selected players on their slots and allows clearing them', async () => {
    const user = userEvent.setup();
    const squad = requireSquad();
    const formation = requireFormation();
    const lineup = brazil433Lineup();
    const evaluation = evaluateLineup(squad, formation, lineup, requireDifficulty(), 'no-ballon-dor');
    const onClearSlot = vi.fn();

    render(
      <Pitch
        formation={formation}
        squad={squad}
        lineup={lineup}
        activeSlotId="rb"
        slotReports={evaluation.slotReports}
        onSlotSelect={vi.fn()}
        onClearSlot={onClearSlot}
      />,
    );

    expect(screen.getByText('Cafu')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear RB' }));

    expect(onClearSlot).toHaveBeenCalledWith('rb');
  });

  it('lets the user choose the active slot from the pitch', async () => {
    const user = userEvent.setup();
    const squad = requireSquad();
    const formation = requireFormation();
    const lineup = brazil433Lineup();
    const evaluation = evaluateLineup(squad, formation, lineup, requireDifficulty(), 'no-ballon-dor');
    const onSlotSelect = vi.fn();

    render(
      <Pitch
        formation={formation}
        squad={squad}
        lineup={lineup}
        activeSlotId="gk"
        slotReports={evaluation.slotReports}
        onSlotSelect={onSlotSelect}
        onClearSlot={vi.fn()}
      />,
    );

    await user.click(screen.getByTitle('Select ST'));

    expect(onSlotSelect).toHaveBeenCalledWith('st');
  });
});

