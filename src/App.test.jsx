import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';
import { setLocale } from './i18n/index.js';

// The real snapshot, cut to the first 30 Pokémon: a page and a bit.
vi.mock('./data.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    POKEDEX: actual.POKEDEX.slice(0, 30),
    fetchDetails: vi.fn(),
    prefetchDetails: vi.fn(),
  };
});

import { fetchDetails } from './data.js';

let observers;

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.disconnect = vi.fn();
    observers.push(this);
  }
  observe() {}
}

beforeEach(() => {
  localStorage.clear();
  observers = [];
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  fetchDetails.mockReset();
  fetchDetails.mockReturnValue(new Promise(() => {}));
});

afterEach(async () => {
  vi.unstubAllGlobals();
  await act(() => setLocale('en'));
});

const searchBox = (utils) => utils.getByLabelText('Search Pokémon by name or number');

describe('App', () => {
  it('renders the first page of the grid immediately, with no loading state', () => {
    const { getByText, getAllByRole } = render(<App />);
    expect(getByText('Showing 24 of 30 Pokémon')).toBeInTheDocument();
    expect(getAllByRole('button', { name: /^View details for / })).toHaveLength(24);
    expect(getByText('Bulbasaur')).toBeInTheDocument();
    expect(getByText('Weedle')).toBeInTheDocument();
  });

  it('filters the grid as the user searches by name', async () => {
    const utils = render(<App />);
    await userEvent.type(searchBox(utils), 'char');
    await waitFor(() => expect(utils.getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());
    expect(utils.getByText('Charmander')).toBeInTheDocument();
    expect(utils.getByText('Charizard')).toBeInTheDocument();
    expect(utils.queryByText('Bulbasaur')).not.toBeInTheDocument();
  });

  it('ignores case and punctuation when searching', async () => {
    const utils = render(<App />);
    await userEvent.type(searchBox(utils), 'BULBA-');
    await waitFor(() => expect(utils.getByText('Showing 1 of 1 Pokémon')).toBeInTheDocument());
  });

  it('filters the grid by dex number search', async () => {
    const utils = render(<App />);
    await userEvent.type(searchBox(utils), '7');
    await waitFor(() => expect(utils.getByText('Showing 1 of 1 Pokémon')).toBeInTheDocument());
    expect(utils.getByText('Squirtle')).toBeInTheDocument();
  });

  it('clears the search box via the clear button', async () => {
    const utils = render(<App />);
    await userEvent.type(searchBox(utils), 'char');
    await waitFor(() => expect(utils.getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());
    await userEvent.click(utils.getByLabelText('Clear search'));
    await waitFor(() => expect(utils.getByText('Showing 24 of 30 Pokémon')).toBeInTheDocument());
    expect(searchBox(utils)).toHaveValue('');
  });

  it('filters the grid by type, and clicking the type again clears it', async () => {
    const { getByText, getByRole, queryByText } = render(<App />);
    await userEvent.click(getByRole('checkbox', { name: 'Fire' }));
    expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument();
    expect(getByText('Charmeleon')).toBeInTheDocument();
    expect(queryByText('Squirtle')).not.toBeInTheDocument();

    await userEvent.click(getByRole('checkbox', { name: 'Fire' }));
    expect(getByText('Showing 24 of 30 Pokémon')).toBeInTheDocument();
    expect(getByRole('checkbox', { name: 'All' })).toBeChecked();
  });

  it('combines type filter and search', async () => {
    const utils = render(<App />);
    await userEvent.click(utils.getByRole('checkbox', { name: 'Poison' }));
    await userEvent.type(searchBox(utils), 'saur');
    await waitFor(() => expect(utils.getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());
  });

  it('toggles a pokemon as favorite from the grid and can filter to favorites only', async () => {
    const { getByText, getByRole, queryByText } = render(<App />);
    await userEvent.click(getByRole('button', { name: 'Add Bulbasaur to favorites' }));
    expect(getByRole('button', { name: 'Remove Bulbasaur from favorites' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('pokedev-favorites'))).toEqual([1]);

    await userEvent.click(getByRole('button', { name: 'Show favorites only' }));
    expect(getByText('Showing 1 of 1 Pokémon')).toBeInTheDocument();
    expect(getByText('Bulbasaur')).toBeInTheDocument();
    expect(queryByText('Charmander')).not.toBeInTheDocument();
  });

  it('shows favorites saved in a previous visit', () => {
    localStorage.setItem('pokedev-favorites', '[4, 7]');
    const { getByRole, getByText } = render(<App />);
    expect(getByRole('button', { name: 'Remove Charmander from favorites' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Remove Squirtle from favorites' })).toBeInTheDocument();
    expect(getByText('2')).toHaveClass('indicator');
  });

  it('shows an empty state with a clear-filters action when favorites is empty', async () => {
    const { getByText, getByRole } = render(<App />);
    await userEvent.click(getByRole('button', { name: 'Show favorites only' }));
    expect(getByText('No Pokémon found in your favorites.')).toBeInTheDocument();

    await userEvent.click(getByText('Clear Filters'));
    expect(getByText('Showing 24 of 30 Pokémon')).toBeInTheDocument();
  });

  it('opens the detail modal when a card is clicked and closes it', async () => {
    const { getByRole, getByLabelText, queryByLabelText } = render(<App />);
    await userEvent.click(getByRole('button', { name: 'View details for Bulbasaur' }));
    expect(getByLabelText('Bulbasaur details')).toHaveAttribute('open');

    await userEvent.click(getByLabelText('Close details'));
    await waitFor(() => expect(queryByLabelText('Bulbasaur details')).not.toBeInTheDocument());
  });

  it('navigates to another pokemon from the evolution chain inside the modal', async () => {
    fetchDetails.mockResolvedValue({
      height: 7,
      weight: 69,
      baseExp: 64,
      stats: [45, 49, 49, 65, 65, 45],
      abilities: [{ name: 'overgrow', hidden: false }],
      genus: 'Seed Pokémon',
      flavor: 'A strange seed was planted on its back at birth.',
      evolution: [[1], [2], [3]],
    });
    const { getByRole, getByLabelText, findByRole } = render(<App />);
    await userEvent.click(getByRole('button', { name: 'View details for Bulbasaur' }));
    await userEvent.click(await findByRole('button', { name: 'View Ivysaur' }));
    expect(getByLabelText('Ivysaur details')).toBeInTheDocument();
    expect(fetchDetails).toHaveBeenLastCalledWith(2, 'en');
  });

  it('focuses the search field when "/" is pressed', async () => {
    const utils = render(<App />);
    await userEvent.keyboard('/');
    expect(searchBox(utils)).toHaveFocus();
  });

  it('does not hijack "/" while a text field already has focus', async () => {
    const utils = render(<App />);
    await userEvent.type(searchBox(utils), '/');
    expect(searchBox(utils)).toHaveValue('/');
  });

  it('paginates as the sentinel intersects, and disconnects the observer on cleanup', async () => {
    const { getByText, queryByText, unmount } = render(<App />);
    expect(getByText('Loading more…')).toBeInTheDocument();

    act(() => observers.at(-1).callback([{ isIntersecting: true }]));
    expect(getByText('Showing 30 of 30 Pokémon')).toBeInTheDocument();
    expect(queryByText('Loading more…')).not.toBeInTheDocument();

    const last = observers.at(-1);
    unmount();
    expect(last.disconnect).toHaveBeenCalled();
  });

  it('searches ignoring accents and punctuation', async () => {
    const utils = render(<App />);
    await userEvent.type(searchBox(utils), 'NIDÓRAN-f');
    await waitFor(() => expect(utils.getByText('Showing 1 of 1 Pokémon')).toBeInTheDocument());
    expect(utils.getByText('Nidoran ♀')).toBeInTheDocument();
  });

  it('switches language, searching by localized and English names', async () => {
    const utils = render(<App />);
    await act(() => setLocale('ja'));
    expect(utils.getByText('30匹中 24匹を表示')).toBeInTheDocument();
    expect(utils.getByText('フシギダネ')).toBeInTheDocument();
    expect(utils.getByRole('checkbox', { name: 'どく' })).toBeInTheDocument();

    // Hiragana finds katakana names.
    const search = utils.getByRole('searchbox');
    await userEvent.type(search, 'ひとかげ');
    await waitFor(() => expect(utils.getByText('1匹中 1匹を表示')).toBeInTheDocument());
    expect(utils.getByText('ヒトカゲ')).toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, 'squirtle');
    await waitFor(() => expect(utils.getByText('ゼニガメ')).toBeInTheDocument());
  });

  it('fetches details in the language of the Pokémon data', async () => {
    const { getByRole } = render(<App />);
    await act(() => setLocale('fr'));
    await userEvent.click(getByRole('button', { name: 'Voir la fiche de Bulbizarre' }));
    expect(fetchDetails).toHaveBeenLastCalledWith(1, 'fr');
  });

  it('does not page while the sentinel is out of range', () => {
    const { getByText } = render(<App />);
    act(() => observers.at(-1).callback([{ isIntersecting: false }]));
    expect(getByText('Showing 24 of 30 Pokémon')).toBeInTheDocument();
  });
});
