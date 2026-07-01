import { useCallback, useEffect, useRef, useState } from 'react';

const FAVORITES_KEY = 'pokedev-favorites';
const MAX_TILT_DEG = 10;
const MAX_PARALLAX_PX = 14;

// Pointer-driven 3D tilt: sets CSS custom properties imperatively (no
// re-renders) so the card's `transform`/`translate` (declared in index.css)
// track the pointer 1:1. Only active for fine-pointer/hover-capable
// devices with no motion-reduction preference — touch and reduced-motion
// users get the static hover/press styles instead.
export function useTilt() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canTilt || reduceMotion) return;

    const handleMove = (e) => {
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
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

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    } catch {
      /* storage unavailable — favorites just won't persist */
    }
  }, [favorites]);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return [favorites, toggleFavorite];
}
