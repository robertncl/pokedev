import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFavorites } from './hooks.js';

describe('useFavorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts empty when localStorage has nothing stored', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current[0]).toEqual(new Set());
  });

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem('pokedev-favorites', JSON.stringify([1, 2, 3]));
    const { result } = renderHook(() => useFavorites());
    expect(result.current[0]).toEqual(new Set([1, 2, 3]));
  });

  it('falls back to an empty set when stored JSON is invalid', () => {
    localStorage.setItem('pokedev-favorites', 'not json');
    const { result } = renderHook(() => useFavorites());
    expect(result.current[0]).toEqual(new Set());
  });

  it('toggleFavorite adds an id that is not yet a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current[1](25));
    expect(result.current[0]).toEqual(new Set([25]));
  });

  it('toggleFavorite removes an id that is already a favorite', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current[1](25));
    act(() => result.current[1](25));
    expect(result.current[0]).toEqual(new Set());
  });

  it('persists favorites to localStorage', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current[1](7));
    expect(JSON.parse(localStorage.getItem('pokedev-favorites'))).toEqual([7]);
  });

  it('shares one set between components', () => {
    const a = renderHook(() => useFavorites());
    const b = renderHook(() => useFavorites());
    act(() => a.result.current[1](4));
    expect(b.result.current[0]).toEqual(new Set([4]));
  });

  it('picks up favorites changed in another tab', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      localStorage.setItem('pokedev-favorites', '[9]');
      window.dispatchEvent(new StorageEvent('storage', { key: 'pokedev-favorites' }));
    });
    expect(result.current[0]).toEqual(new Set([9]));
  });

  it('does not throw when localStorage.setItem fails', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const { result } = renderHook(() => useFavorites());
    expect(() => act(() => result.current[1](1))).not.toThrow();
    expect(result.current[0]).toEqual(new Set([1]));
    spy.mockRestore();
  });
});
