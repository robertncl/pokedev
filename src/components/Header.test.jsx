import { createRef } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setLocale } from '../i18n/index.js';
import Header from './Header.jsx';

function setup(props = {}) {
  const searchRef = createRef();
  const onSearchChange = vi.fn();
  const onToggleFavorites = vi.fn();
  const element = (overrides) => (
    <Header
      search=""
      onSearchChange={onSearchChange}
      searchRef={searchRef}
      showFavorites={false}
      onToggleFavorites={onToggleFavorites}
      favoriteCount={0}
      {...props}
      {...overrides}
    />
  );
  const utils = render(element());
  return { ...utils, rerenderWith: (overrides) => utils.rerender(element(overrides)), onSearchChange, onToggleFavorites, searchRef };
}

beforeEach(() => {
  localStorage.clear();
  document.querySelector('meta[name="color-scheme"]').content = 'light dark';
});

afterEach(async () => {
  await act(() => setLocale('en'));
});

describe('Header', () => {
  it('renders the title and search input', () => {
    const { getByLabelText, getByRole } = setup();
    expect(getByRole('heading', { level: 1 })).toHaveTextContent('PokéDev');
    expect(getByLabelText('Search Pokémon by name or number')).toBeInTheDocument();
  });

  it('forwards the search ref to the input', () => {
    const { searchRef } = setup();
    expect(searchRef.current).toBe(document.querySelector('input'));
  });

  it('calls onSearchChange as the user types', async () => {
    const { getByLabelText, onSearchChange } = setup();
    await userEvent.type(getByLabelText('Search Pokémon by name or number'), 'pika');
    expect(onSearchChange.mock.calls.map((c) => c[0]).join('')).toBe('pika');
  });

  it('shows a clear button only when there is search text, and clears on click', async () => {
    const { queryByLabelText, getByLabelText, rerenderWith, onSearchChange } = setup();
    expect(queryByLabelText('Clear search')).not.toBeInTheDocument();

    rerenderWith({ search: 'pika' });
    await userEvent.click(getByLabelText('Clear search'));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('calls onToggleFavorites when the favorites button is clicked', async () => {
    const { getByTitle, onToggleFavorites } = setup();
    await userEvent.click(getByTitle('Show favorites only'));
    expect(onToggleFavorites).toHaveBeenCalled();
  });

  it('shows the favorites count indicator only when there are favorites', () => {
    const { getByText, queryByText, rerenderWith } = setup({ favoriteCount: 3 });
    expect(getByText('3')).toBeInTheDocument();
    rerenderWith({ favoriteCount: 0 });
    expect(queryByText('0')).not.toBeInTheDocument();
  });

  it('marks the favorites filter as pressed and retitles it when active', () => {
    const { getByTitle } = setup({ showFavorites: true });
    expect(getByTitle('Show all Pokémon')).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches language from the language picker', async () => {
    const { getByLabelText, findByLabelText } = setup();
    const picker = getByLabelText('Language');
    expect(picker).toHaveValue('en');
    expect(picker.options).toHaveLength(15);

    await userEvent.selectOptions(picker, 'de');
    expect(await findByLabelText('Pokémon nach Name oder Nummer suchen')).toBeInTheDocument();
    expect(getByLabelText('Sprache')).toHaveValue('de');
    expect(localStorage.getItem('pokedev-locale')).toBe('de');
  });

  it('toggles the color scheme when the theme button is clicked', async () => {
    const { getByLabelText } = setup();
    await userEvent.click(getByLabelText('Toggle color scheme'));
    // The system scheme is light in jsdom, so the toggle switches to dark.
    expect(document.querySelector('meta[name="color-scheme"]').content).toBe('dark');
  });
});
