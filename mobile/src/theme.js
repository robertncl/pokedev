import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'pokedev-theme';

export const COLORS = {
  light: {
    bg: '#f1f3f7',
    surface: '#ffffff',
    surfaceAlt: '#f8f9fb',
    text: '#1a1b1e',
    dimmed: '#868e96',
    border: '#e6e8ee',
    accent: '#ee5253',
    onAccent: '#ffffff',
    dish: '#eef1f6',
    overlay: 'rgba(0,0,0,0.45)',
  },
  dark: {
    bg: '#161719',
    surface: '#222327',
    surfaceAlt: '#2a2b30',
    text: '#e9ecef',
    dimmed: '#909296',
    border: '#34363c',
    accent: '#f0696a',
    onAccent: '#ffffff',
    dish: '#2c2d32',
    overlay: 'rgba(0,0,0,0.6)',
  },
};

const ThemeContext = createContext({ scheme: 'light', colors: COLORS.light, toggle: () => {} });

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [override, setOverride] = useState(null); // null = follow system

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === 'light' || v === 'dark') setOverride(v);
    });
  }, []);

  const scheme = override || system || 'light';

  const toggle = () => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    setOverride(next);
    AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ scheme, colors: COLORS[scheme], toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
