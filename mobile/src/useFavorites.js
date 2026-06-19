import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'pokedev-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => new Set());
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY)
      .then((raw) => {
        if (raw) setFavorites(new Set(JSON.parse(raw)));
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  useEffect(() => {
    // Avoid clobbering stored favorites with the empty initial set on first mount.
    if (!loaded.current) return;
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites])).catch(() => {});
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
