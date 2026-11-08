import { useSyncExternalStore } from 'react';

const FAVORITES_KEY = 'pokedev-favorites';
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
