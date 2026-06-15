import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EvaluationPanel from '../EvaluationPanel';
import { evaluateLineup } from '../../game-engine/evaluation';
import { createEmptyLineup } from '../../game-engine/formations';
import { brazil433Lineup, requireDifficulty, requireFormation, requireSquad } from '../../test/fixtures';

describe('EvaluationPanel', () => {
  it('blocks simulation until the XI is complete', () => {
    const squad = requireSquad();
    const formation = requireFormation();
    const evaluation = evaluateLineup(squad, formation, createEmptyLineup(formation), requireDifficulty(), 'no-ballon-dor');

    render(<EvaluationPanel evaluation={evaluation} onSimulate={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Simulate Match' })).toBeDisabled();
    expect(screen.getByText('0/11 positions filled')).toBeInTheDocument();
  });

  it('submits simulation when the XI is complete and legal', async () => {
    const user = userEvent.setup();
    const squad = requireSquad();
    const formation = requireFormation();
    const evaluation = evaluateLineup(squad, formation, brazil433Lineup(), requireDifficulty(), 'defensive-core');
    const onSimulate = vi.fn();

    render(<EvaluationPanel evaluation={evaluation} onSimulate={onSimulate} />);

    await user.click(screen.getByRole('button', { name: 'Simulate Match' }));

    expect(onSimulate).toHaveBeenCalledTimes(1);
  });
});

