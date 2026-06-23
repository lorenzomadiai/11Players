import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SelectedXI from '../SelectedXI';
import { evaluateLineup } from '../../game-engine/evaluation';
import { createEmptyLineup } from '../../game-engine/formations';
import { brazil433Lineup, requireDifficulty, requireFormation } from '../../test/fixtures';

describe('SelectedXI', () => {
  it('blocks kick off until the XI is complete', () => {
    const formation = requireFormation();
    const lineup = createEmptyLineup(formation);
    const evaluation = evaluateLineup(formation, lineup, requireDifficulty(), 'free-play');

    render(<SelectedXI formation={formation} lineup={lineup} evaluation={evaluation} onSimulate={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Kick Off (0/11)' })).toBeDisabled();
    expect(screen.getByText('No players picked yet. Your selections will collect here.')).toBeInTheDocument();
  });

  it('submits simulation when the XI is complete', async () => {
    const user = userEvent.setup();
    const formation = requireFormation();
    const lineup = brazil433Lineup();
    const evaluation = evaluateLineup(formation, lineup, requireDifficulty(), 'free-play');
    const onSimulate = vi.fn();

    render(<SelectedXI formation={formation} lineup={lineup} evaluation={evaluation} onSimulate={onSimulate} />);

    await user.click(screen.getByRole('button', { name: 'Kick Off' }));

    expect(onSimulate).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Cafu')).toBeInTheDocument();
    expect(screen.getByText('ATT')).toBeInTheDocument();
    expect(screen.getByText('DEF')).toBeInTheDocument();
  });
});
