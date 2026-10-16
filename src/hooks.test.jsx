import { act, render, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFavorites, useTilt } from './hooks.js';

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

describe('useTilt', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  function TiltTarget() {
    const ref = useTilt();
    return <div ref={ref} data-testid="tilt-target" style={{ width: 100, height: 100 }} />;
  }

  function enableTilt() {
    vi.stubGlobal('matchMedia', (query) => ({
      matches: query.includes('hover: hover'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
  }

  function renderTarget() {
    const utils = render(<TiltTarget />);
    const node = utils.getByTestId('tilt-target');
    vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 100, height: 100 });
    return { ...utils, node };
  }

  const move = (node, clientX, clientY) =>
    act(() => {
      node.dispatchEvent(new PointerEvent('pointermove', { clientX, clientY, bubbles: true }));
    });

  it('does nothing when the pointer/hover media query does not match', () => {
    const { node } = renderTarget();
    move(node, 75, 25);
    expect(node.style.getPropertyValue('--glare-o')).toBe('');
  });

  it('sets CSS custom properties on pointermove and clears them on pointerleave when tilt is enabled', () => {
    enableTilt();
    const { node } = renderTarget();

    move(node, 75, 25);
    expect(node.style.getPropertyValue('--glare-o')).toBe('1');
    expect(node.style.getPropertyValue('--tilt-rx')).toBe('5.00deg');
    expect(node.style.getPropertyValue('--tilt-ry')).toBe('5.00deg');
    expect(node.style.transition).toBe('none');

    act(() => {
      node.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    });
    expect(node.style.getPropertyValue('--glare-o')).toBe('0');
    expect(node.style.getPropertyValue('--tilt-rx')).toBe('0deg');
    expect(node.style.transition).toBe('');
  });

  it('measures the surface once per hover rather than on every move', () => {
    enableTilt();
    const { node } = renderTarget();
    move(node, 10, 10);
    move(node, 20, 20);
    expect(node.getBoundingClientRect).toHaveBeenCalledTimes(1);

    act(() => {
      node.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    });
    move(node, 30, 30);
    expect(node.getBoundingClientRect).toHaveBeenCalledTimes(2);
  });

  it('caps the tilt when the pointer is outside the measured box', () => {
    enableTilt();
    const { node } = renderTarget();
    move(node, 500, -500);
    expect(node.style.getPropertyValue('--tilt-rx')).toBe('10.00deg');
    expect(node.style.getPropertyValue('--tilt-ry')).toBe('10.00deg');
  });

  it('removes listeners on unmount', () => {
    enableTilt();
    const { node, unmount } = renderTarget();
    const removeSpy = vi.spyOn(node, 'removeEventListener');
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointerleave', expect.any(Function));
  });
});
