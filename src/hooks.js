import { useEffect, useRef, useSyncExternalStore } from 'react';

const FAVORITES_KEY = 'pokedev-favorites';
const MAX_TILT_DEG = 10;
const MAX_PARALLAX_PX = 14;

const clamp01 = (value) => Math.min(1, Math.max(0, value));

// Pointer-driven 3D tilt: sets CSS custom properties imperatively (no
// re-renders) that the `.tilt` styles in index.css read, so the surface tracks
// the pointer 1:1. Only active for fine-pointer/hover-capable devices with no
// motion-reduction preference — touch and reduced-motion users get the static
// hover/press styles instead.
export function useTilt() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canTilt || reduceMotion) return;

    // Measured once per hover: reading it on every move would force a style
    // recalc each time, and since it includes the tilt it would skew the angles.
    let rect = null;

    const handleMove = (e) => {
      rect ??= node.getBoundingClientRect();
      const px = clamp01((e.clientX - rect.left) / rect.width);
      const py = clamp01((e.clientY - rect.top) / rect.height);
      node.style.transition = 'none';
      node.style.setProperty('--tilt-rx', `${((0.5 - py) * MAX_TILT_DEG * 2).toFixed(2)}deg`);
      node.style.setProperty('--tilt-ry', `${((px - 0.5) * MAX_TILT_DEG * 2).toFixed(2)}deg`);
      node.style.setProperty('--tilt-px', `${((px - 0.5) * MAX_PARALLAX_PX).toFixed(1)}px`);
      node.style.setProperty('--tilt-py', `${((py - 0.5) * MAX_PARALLAX_PX).toFixed(1)}px`);
      node.style.setProperty('--glare-x', `${(px * 100).toFixed(1)}%`);
      node.style.setProperty('--glare-y', `${(py * 100).toFixed(1)}%`);
      node.style.setProperty('--glare-o', '1');
    };
    const handleLeave = () => {
      rect = null;
      node.style.transition = '';
      node.style.setProperty('--tilt-rx', '0deg');
      node.style.setProperty('--tilt-ry', '0deg');
      node.style.setProperty('--tilt-px', '0px');
      node.style.setProperty('--tilt-py', '0px');
      node.style.setProperty('--glare-o', '0');
    };

    node.addEventListener('pointermove', handleMove);
    node.addEventListener('pointerleave', handleLeave);
    return () => {
      node.removeEventListener('pointermove', handleMove);
      node.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  return ref;
}

// Favorites are a small external store over localStorage, read with
// useSyncExternalStore so the prerendered page (which has no storage, hence
// no favorites) hydrates cleanly before the saved set is swapped in.
const NO_FAVORITES = new Set();
const listeners = new Set();
let favorites; // cached snapshot; undefined means "re-read from storage"

function readFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

const getFavorites = () => (favorites ??= readFavorites());

function notify() {
  for (const listener of listeners) listener();
}

// Keeps tabs in sync. `key` is null when storage was cleared.
function handleStorage(e) {
  if (e.key !== FAVORITES_KEY && e.key !== null) return;
  favorites = undefined;
  notify();
}

function subscribe(listener) {
  if (listeners.size === 0) window.addEventListener('storage', handleStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('storage', handleStorage);
      favorites = undefined;
    }
  };
}

function toggleFavorite(id) {
  const next = new Set(getFavorites());
  if (!next.delete(id)) next.add(id);
  favorites = next;
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...next]));
  } catch {
    /* storage unavailable — favorites just won't persist */
  }
  notify();
}

export function useFavorites() {
  const current = useSyncExternalStore(subscribe, getFavorites, () => NO_FAVORITES);
  return [current, toggleFavorite];
}
