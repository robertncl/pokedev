import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COLOR_SCHEME_KEY, syncColorSchemeAcrossTabs, toggleColorScheme } from './colorScheme.js';

const meta = () => document.querySelector('meta[name="color-scheme"]');

function systemPrefers(scheme) {
  vi.stubGlobal('matchMedia', (query) => ({
    matches: query === '(prefers-color-scheme: dark)' && scheme === 'dark',
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

beforeEach(() => {
  localStorage.clear();
  meta().content = 'light dark';
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('toggleColorScheme', () => {
  it('switches to the opposite of the system scheme and stores the override', () => {
    systemPrefers('light');
    toggleColorScheme();
    expect(meta().content).toBe('dark');
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('dark');
  });

  it('clears the override when toggling back to the system scheme', () => {
    systemPrefers('light');
    toggleColorScheme();
    toggleColorScheme();
    expect(meta().content).toBe('light dark');
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBeNull();
  });

  it('toggles from what is shown, even when an override matches the system', () => {
    systemPrefers('dark');
    meta().content = 'dark';
    localStorage.setItem(COLOR_SCHEME_KEY, 'dark');
    toggleColorScheme();
    expect(meta().content).toBe('light');
    expect(localStorage.getItem(COLOR_SCHEME_KEY)).toBe('light');
  });

  it('drops the setting left by the Mantine-based version', () => {
    systemPrefers('light');
    localStorage.setItem('mantine-color-scheme-value', 'dark');
    toggleColorScheme();
    expect(localStorage.getItem('mantine-color-scheme-value')).toBeNull();
  });

  it('still switches the scheme when storage is unavailable', () => {
    systemPrefers('light');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    toggleColorScheme();
    expect(meta().content).toBe('dark');
  });
});

describe('syncColorSchemeAcrossTabs', () => {
  it('applies overrides set or cleared in another tab', () => {
    const stop = syncColorSchemeAcrossTabs();
    window.dispatchEvent(new StorageEvent('storage', { key: COLOR_SCHEME_KEY, newValue: 'dark' }));
    expect(meta().content).toBe('dark');
    window.dispatchEvent(new StorageEvent('storage', { key: null, newValue: null }));
    expect(meta().content).toBe('light dark');

    stop();
    window.dispatchEvent(new StorageEvent('storage', { key: COLOR_SCHEME_KEY, newValue: 'dark' }));
    expect(meta().content).toBe('light dark');
  });

  it('ignores unrelated keys', () => {
    const stop = syncColorSchemeAcrossTabs();
    window.dispatchEvent(new StorageEvent('storage', { key: 'pokedev-favorites', newValue: '[1]' }));
    expect(meta().content).toBe('light dark');
    stop();
  });
});
