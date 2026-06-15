import { beforeEach, describe, expect, it } from 'vitest';
import { loadFromStorage, saveToStorage } from '../storage';

describe('storage helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads the fallback when no saved state exists', () => {
    expect(loadFromStorage('missing-key', { phase: 'landing' })).toEqual({ phase: 'landing' });
  });

  it('round-trips JSON values through localStorage', () => {
    const state = { phase: 'selection', lineup: { gk: 'bra-2002-marcos' } };

    saveToStorage('game-state', state);

    expect(loadFromStorage('game-state', { phase: 'landing' })).toEqual(state);
  });

  it('falls back when stored JSON is corrupt', () => {
    window.localStorage.setItem('game-state', '{bad json');

    expect(loadFromStorage('game-state', { phase: 'landing' })).toEqual({ phase: 'landing' });
  });
});

