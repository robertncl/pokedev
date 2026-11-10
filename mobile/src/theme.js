import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'pokedev-theme';

// ACME design system v5 (Graphite + ink + Blue), mirrored from the web app's
// index.css. The system is light-only; `dark` maps the same ramps onto a dark
// ground so the app keeps its theme toggle.
const GRAY = {
  0: '#ffffff',
  50: '#f8f9fa',
  100: '#f1f3f5',
  200: '#e2e5e9',
  300: '#c8cdd3',
  400: '#838a94',
  500: '#676e78',
  600: '#525961',
  700: '#3c424a',
  800: '#272c32',
  900: '#15181d',
  950: '#0b0d10',
};
const RED = { 500: '#e43227', 600: '#c91c15', 700: '#a91515', 300: '#fb8d82' };
const BLUE = { 50: '#eef4ff', 200: '#bcd0fb', 300: '#86acfa', 600: '#1f57c9', 700: '#1a47a6', 800: '#163a85' };

export const COLORS = {
  light: {
    canvas: GRAY[0],
    surface: GRAY[50],
    surfaceHover: GRAY[100],
    surfaceRaised: GRAY[0],
    border: GRAY[200],
    borderControl: GRAY[300],
    borderStrong: GRAY[400],
    text: GRAY[900],
    textMuted: GRAY[600],
    textSubtle: GRAY[500],
    primary: GRAY[900],
    primaryActive: GRAY[800],
    onPrimary: GRAY[0],
    mark: RED[600],
    selected: BLUE[600],
    selectedSoft: BLUE[50],
    selectedBorder: BLUE[200],
    link: BLUE[700],
    danger: RED[700],
    data: GRAY[400],
    dataHighlight: BLUE[600],
    scrim: 'rgba(11,13,16,0.45)',
    shadowSm: '0 1px 2px rgba(16,24,40,0.05)',
    shadowMd: '0 4px 12px -2px rgba(16,24,40,0.08)',
    shadowLg: '0 16px 40px -8px rgba(16,24,40,0.18)',
  },
  dark: {
    canvas: GRAY[950],
    surface: GRAY[900],
    surfaceHover: GRAY[800],
    surfaceRaised: GRAY[900],
    border: GRAY[800],
    borderControl: GRAY[700],
    borderStrong: GRAY[500],
    text: GRAY[100],
    textMuted: GRAY[300],
    textSubtle: GRAY[400],
    primary: GRAY[100],
    primaryActive: GRAY[200],
    onPrimary: GRAY[900],
    mark: RED[500],
    selected: BLUE[300],
    selectedSoft: '#152645',
    selectedBorder: BLUE[800],
    link: BLUE[300],
    danger: RED[300],
    data: GRAY[400],
    dataHighlight: BLUE[300],
    scrim: 'rgba(11,13,16,0.6)',
    shadowSm: '0 1px 2px rgba(0,0,0,0.4)',
    shadowMd: '0 4px 12px -2px rgba(0,0,0,0.5)',
    shadowLg: '0 16px 40px -8px rgba(0,0,0,0.6)',
  },
};

// 4px grid.
export const SPACE = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48 };
export const RADIUS = { sm: 4, md: 6, lg: 10, xl: 12, full: 999 };
export const TEXT = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24 };

// Custom fonts pick a weight by family name, not fontWeight (Android ignores it).
export const FONTS = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoStrong: 'JetBrainsMono_600SemiBold',
};
export const font = (weight = 400) => ({ fontFamily: FONTS[weight] });

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
