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

  it('does not throw when localStorage.setItem fails', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const { result } = renderHook(() => useFavorites());
    expect(() => act(() => result.current[1](1))).not.toThrow();
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

  it('returns a ref that attaches to the rendered node', () => {
    const { getByTestId } = render(<TiltTarget />);
    expect(getByTestId('tilt-target')).toBeInTheDocument();
  });

  it('does nothing when the pointer/hover media query does not match', () => {
    vi.stubGlobal('matchMedia', (query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { getByTestId } = render(<TiltTarget />);
    const node = getByTestId('tilt-target');
    const addSpy = vi.spyOn(node, 'addEventListener');
    // Re-render is not needed: effect already ran on mount with matches:false,
    // so no listeners should have been attached.
    expect(addSpy).not.toHaveBeenCalledWith('pointermove', expect.anything());
  });

  it('sets CSS custom properties on pointermove and clears them on pointerleave when tilt is enabled', () => {
    vi.stubGlobal('matchMedia', (query) => ({
      matches: query.includes('hover: hover'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { getByTestId } = render(<TiltTarget />);
    const node = getByTestId('tilt-target');
    vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    });

    act(() => {
      node.dispatchEvent(
        new PointerEvent('pointermove', { clientX: 75, clientY: 25, bubbles: true })
      );
    });
    expect(node.style.getPropertyValue('--glare-o')).toBe('1');
    expect(node.style.getPropertyValue('--tilt-rx')).not.toBe('');

    act(() => {
      node.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
    });
    expect(node.style.getPropertyValue('--glare-o')).toBe('0');
    expect(node.style.getPropertyValue('--tilt-rx')).toBe('0deg');
  });

  it('removes listeners on unmount', () => {
    vi.stubGlobal('matchMedia', (query) => ({
      matches: query.includes('hover: hover'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { getByTestId, unmount } = render(<TiltTarget />);
    const node = getByTestId('tilt-target');
    const removeSpy = vi.spyOn(node, 'removeEventListener');
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('pointerleave', expect.any(Function));
  });
});
