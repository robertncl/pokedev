import { createTheme } from '@mantine/core';

// Pokémon-red primary scale (index 0 = lightest, 9 = darkest).
const pokeRed = [
  '#ffe9e9',
  '#ffd1d1',
  '#fba0a1',
  '#f76d6e',
  '#f24344',
  '#f02a2b',
  '#f0191c',
  '#d60b11',
  '#bf000c',
  '#a70003',
];

export const theme = createTheme({
  primaryColor: 'pokeRed',
  primaryShade: { light: 6, dark: 5 },
  colors: { pokeRed },
  defaultRadius: 'lg',
  fontFamily: "'Nunito', system-ui, -apple-system, 'Segoe UI', sans-serif",
  headings: {
    fontFamily: "'Nunito', system-ui, sans-serif",
    fontWeight: '800',
  },
  cursorType: 'pointer',
});
