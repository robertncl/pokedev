import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCALE_KEY, matchLocale, setLocale, useI18n } from './index.js';

beforeEach(() => {
  localStorage.clear();
});

afterEach(async () => {
  await act(() => setLocale('en'));
  localStorage.clear();
});

const pikachu = { id: 25, name: 'pikachu' };

describe('matchLocale', () => {
  it('picks the first supported language, by base language', () => {
    expect(matchLocale(['sv-SE', 'pt-BR', 'en'])).toBe('pt');
    expect(matchLocale(['es-MX'])).toBe('es');
    expect(matchLocale(['in'])).toBe('id'); // legacy Indonesian tag
  });

  it('tells Simplified and Traditional Chinese apart by script or region', () => {
    expect(matchLocale(['zh-CN'])).toBe('zh-Hans');
    expect(matchLocale(['zh'])).toBe('zh-Hans');
    expect(matchLocale(['zh-TW'])).toBe('zh-Hant');
    expect(matchLocale(['zh-HK'])).toBe('zh-Hant');
    expect(matchLocale(['zh-Hant-SG'])).toBe('zh-Hant');
  });

  it('falls back to English, skipping invalid tags', () => {
    expect(matchLocale(['sv', 'not a tag'])).toBe('en');
    expect(matchLocale([])).toBe('en');
  });
});

describe('useI18n', () => {
  it('starts in English', () => {
    const { result } = renderHook(() => useI18n());
    const { locale, dir, t, pokemonName, abilityName, typeName } = result.current;
    expect(locale).toBe('en');
    expect(dir).toBe('ltr');
    expect(t('results.count', { shown: 3, total: 9 })).toBe('Showing 3 of 9 Pokémon');
    expect(pokemonName(pikachu)).toBe('Pikachu');
    expect(abilityName('lightning-rod')).toBe('Lightning Rod');
    expect(typeName('electric')).toBe('Electric');
  });

  it('switches language, with official Pokémon names, and remembers the choice', async () => {
    const { result } = renderHook(() => useI18n());
    await act(() => setLocale('ja'));

    const { locale, dataLocale, t, pokemonName, abilityName, typeName } = result.current;
    expect(locale).toBe('ja');
    expect(dataLocale).toBe('ja');
    expect(t('filter.all')).toBe('すべて');
    expect(pokemonName(pikachu)).toBe('ピカチュウ');
    expect(abilityName('static')).toBe('せいでんき');
    expect(typeName('electric')).toBe('でんき');
    expect(localStorage.getItem(LOCALE_KEY)).toBe('ja');
    expect(document.documentElement.lang).toBe('ja');
    expect(document.title).toBe('PokéDev · モダンなポケモン図鑑');
  });

  it('shows English Pokémon data in languages without official names', async () => {
    const { result } = renderHook(() => useI18n());
    await act(() => setLocale('ru'));

    const { dataLocale, t, pokemonName, typeName } = result.current;
    expect(dataLocale).toBe('en');
    expect(t('filter.all')).toBe('Все');
    expect(pokemonName(pikachu)).toBe('Pikachu');
    expect(typeName('electric')).toBe('Электрический');
  });

  it('lays the page out right to left for Arabic', async () => {
    await act(() => setLocale('ar'));
    expect(document.documentElement.dir).toBe('rtl');
    await act(() => setLocale('en'));
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('formats numbers and units for the language', async () => {
    const { result } = renderHook(() => useI18n());
    expect(result.current.formatNumber(1025)).toBe('1,025');
    expect(result.current.formatUnit(0.4, 'meter')).toBe('0.4 m');

    await act(() => setLocale('de'));
    expect(result.current.formatNumber(1025)).toBe('1.025');
    expect(result.current.formatUnit(6, 'kilogram')).toBe('6,0 kg');
  });

  it('keeps the last choice when an earlier one finishes loading later', async () => {
    const { result } = renderHook(() => useI18n());
    await act(async () => {
      const first = setLocale('fr');
      const second = setLocale('en');
      await Promise.all([first, second]);
    });
    expect(result.current.locale).toBe('en');
    expect(localStorage.getItem(LOCALE_KEY)).toBe('en');
  });

  it('falls back to English for an unknown language', async () => {
    const { result } = renderHook(() => useI18n());
    await act(() => setLocale('xx'));
    expect(result.current.locale).toBe('en');
  });
});

describe('initLocale', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the saved language, then the browser language, and follows other tabs', async () => {
    vi.resetModules();
    const i18n = await import('./index.js');
    const { result } = renderHook(() => i18n.useI18n());
    vi.stubGlobal('navigator', { languages: ['ko-KR', 'en-US'] });

    let stop;
    await act(async () => {
      stop = i18n.initLocale();
    });
    await vi.waitFor(() => expect(result.current.locale).toBe('ko'));

    localStorage.setItem(i18n.LOCALE_KEY, 'it');
    await act(async () => {
      window.dispatchEvent(new StorageEvent('storage', { key: i18n.LOCALE_KEY, newValue: 'it' }));
    });
    await vi.waitFor(() => expect(result.current.locale).toBe('it'));

    stop();
    await act(() => i18n.setLocale('en'));
  });
});
