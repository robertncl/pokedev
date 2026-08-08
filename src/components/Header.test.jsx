import { createRef } from 'react';
import { MantineProvider } from '@mantine/core';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { theme } from '../theme.js';
import { renderWithProviders } from '../test/render.jsx';
import Header from './Header.jsx';

function setup(props = {}) {
  const searchRef = createRef();
  const onSearchChange = vi.fn();
  const onToggleFavorites = vi.fn();
  const utils = renderWithProviders(
    <Header
      search=""
      onSearchChange={onSearchChange}
      searchRef={searchRef}
      showFavorites={false}
      onToggleFavorites={onToggleFavorites}
      favoriteCount={0}
      {...props}
    />
  );
  return { ...utils, onSearchChange, onToggleFavorites, searchRef };
}

describe('Header', () => {
  it('renders the title and search input', () => {
    const { getByLabelText, getByText } = setup();
    expect(getByText('Dev')).toBeInTheDocument();
    expect(getByLabelText('Search Pokémon by name or number')).toBeInTheDocument();
  });

  it('calls onSearchChange as the user types', async () => {
    const { getByLabelText, onSearchChange } = setup();
    await userEvent.type(getByLabelText('Search Pokémon by name or number'), 'pika');
    expect(onSearchChange).toHaveBeenCalled();
    expect(onSearchChange.mock.calls.map((c) => c[0]).join('')).toBe('pika');
  });

  it('shows a clear button only when there is search text, and clears on click', async () => {
    const { queryByLabelText, rerender, getByLabelText, onSearchChange } = setup();
    expect(queryByLabelText('Clear search')).not.toBeInTheDocument();

    rerender(
      <MantineProvider theme={theme}>
        <Header
          search="pika"
          onSearchChange={onSearchChange}
          searchRef={createRef()}
          showFavorites={false}
          onToggleFavorites={() => {}}
          favoriteCount={0}
        />
      </MantineProvider>
    );
    await userEvent.click(getByLabelText('Clear search'));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('calls onToggleFavorites when the favorites button is clicked', async () => {
    const { getByTitle, onToggleFavorites } = setup();
    await userEvent.click(getByTitle('Show favorites only'));
    expect(onToggleFavorites).toHaveBeenCalled();
  });

  it('shows the favorites count indicator when there are favorites', () => {
    const { getByText } = setup({ favoriteCount: 3 });
    expect(getByText('3')).toBeInTheDocument();
  });

  it('shows "Show all Pokémon" title when favorites filter is active', () => {
    const { getByTitle } = setup({ showFavorites: true });
    expect(getByTitle('Show all Pokémon')).toBeInTheDocument();
  });

  it('toggles the color scheme when the theme button is clicked', async () => {
    const { getByLabelText } = setup();
    const toggle = getByLabelText('Toggle color scheme');
    await userEvent.click(toggle);
    // Toggling should not throw and the button remains present/interactive.
    expect(toggle).toBeInTheDocument();
  });
});
