import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderWithProviders, waitFor } from './test/render.jsx';
import App from './App.jsx';

vi.mock('./api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchIndex: vi.fn(),
    fetchPokemon: vi.fn(),
    fetchTypeMembers: vi.fn(),
    fetchSpecies: vi.fn(() => new Promise(() => {})),
    fetchEvolutionChain: vi.fn(() => new Promise(() => {})),
  };
});

import { fetchEvolutionChain, fetchIndex, fetchPokemon, fetchSpecies, fetchTypeMembers } from './api.js';

const index = [
  { name: 'bulbasaur', id: 1 },
  { name: 'charmander', id: 4 },
  { name: 'squirtle', id: 7 },
];

function pokemonDetail(id, name, type = 'normal') {
  return {
    id,
    name,
    species: { url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
    sprites: {},
    types: [{ type: { name: type } }],
    abilities: [],
    stats: [{ stat: { name: 'hp' }, base_stat: 40 }],
    height: 10,
    weight: 100,
    base_experience: 50,
  };
}

const details = {
  1: pokemonDetail(1, 'bulbasaur', 'grass'),
  2: pokemonDetail(2, 'ivysaur', 'grass'),
  4: pokemonDetail(4, 'charmander', 'fire'),
  7: pokemonDetail(7, 'squirtle', 'water'),
};

beforeEach(() => {
  fetchIndex.mockReset();
  fetchPokemon.mockReset();
  fetchTypeMembers.mockReset();
  fetchSpecies.mockReset();
  fetchEvolutionChain.mockReset();
  fetchSpecies.mockReturnValue(new Promise(() => {}));
  fetchEvolutionChain.mockReturnValue(new Promise(() => {}));
  localStorage.clear();
  fetchPokemon.mockImplementation((idOrName) => {
    const found = Object.values(details).find(
      (d) => d.name === idOrName || d.id === idOrName
    );
    return found ? Promise.resolve(found) : Promise.reject(new Error('not found'));
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App', () => {
  it('shows a loading state, then the boot error banner when the index fetch fails, and retries', async () => {
    fetchIndex.mockRejectedValueOnce(new Error('network down'));
    fetchIndex.mockResolvedValueOnce(index);

    const { getByText } = renderWithProviders(<App />);
    expect(getByText('Loading Pokédex…')).toBeInTheDocument();

    await waitFor(() =>
      expect(getByText("Couldn't reach PokéAPI. Check your connection.")).toBeInTheDocument()
    );

    await userEvent.click(getByText('Try Again'));
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());
  });

  it('renders the grid of loaded pokemon once index and details resolve', async () => {
    fetchIndex.mockResolvedValue(index);
    const { getByText, findByText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());
    await findByText('Bulbasaur');
    expect(getByText('Charmander')).toBeInTheDocument();
    expect(getByText('Squirtle')).toBeInTheDocument();
  });

  it('filters the grid as the user searches by name', async () => {
    fetchIndex.mockResolvedValue(index);
    const { getByText, getByLabelText, queryByText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.type(getByLabelText('Search Pokémon by name or number'), 'char');
    await waitFor(() => expect(getByText('Showing 1 of 1 Pokémon')).toBeInTheDocument());
    expect(getByText('Charmander')).toBeInTheDocument();
    expect(queryByText('Bulbasaur')).not.toBeInTheDocument();
  });

  it('filters the grid by dex number search', async () => {
    fetchIndex.mockResolvedValue(index);
    const { getByText, getByLabelText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.type(getByLabelText('Search Pokémon by name or number'), '7');
    await waitFor(() => expect(getByText('Showing 1 of 1 Pokémon')).toBeInTheDocument());
    expect(getByText('Squirtle')).toBeInTheDocument();
  });

  it('clears the search box via the clear button', async () => {
    fetchIndex.mockResolvedValue(index);
    const { getByText, getByLabelText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.type(getByLabelText('Search Pokémon by name or number'), 'char');
    await waitFor(() => expect(getByText('Showing 1 of 1 Pokémon')).toBeInTheDocument());
    await userEvent.click(getByLabelText('Clear search'));
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());
  });

  it('filters the grid by selected type, fetching type members on demand', async () => {
    fetchIndex.mockResolvedValue(index);
    fetchTypeMembers.mockResolvedValue(new Set([4]));
    const { getByText, getByRole, findByText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.click(getByRole('checkbox', { name: 'Fire' }));
    await findByText('Showing 1 of 1 Pokémon');
    expect(getByText('Charmander')).toBeInTheDocument();
    expect(fetchTypeMembers).toHaveBeenCalledWith('fire');
  });

  it('shows a grid error banner when a type member fetch fails, and retry clears it', async () => {
    fetchIndex.mockResolvedValue(index);
    fetchTypeMembers.mockRejectedValueOnce(new Error('boom'));
    fetchTypeMembers.mockResolvedValueOnce(new Set([4]));
    const { getByText, getByRole, findByText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.click(getByRole('checkbox', { name: 'Fire' }));
    await findByText('Some Pokémon failed to load.');

    await userEvent.click(getByText('Retry'));
    await findByText('Showing 1 of 1 Pokémon');
  });

  it('toggles a pokemon as favorite from the grid and can filter to favorites only', async () => {
    fetchIndex.mockResolvedValue(index);
    const { getByText, getByRole, findByRole, queryByText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.click(await findByRole('button', { name: 'Add Bulbasaur to favorites' }));
    await userEvent.click(getByRole('button', { name: 'Show favorites only' }));

    await waitFor(() => expect(getByText('Showing 1 of 1 Pokémon')).toBeInTheDocument());
    expect(getByText('Bulbasaur')).toBeInTheDocument();
    expect(queryByText('Charmander')).not.toBeInTheDocument();
  });

  it('shows an empty state with a clear-filters action when favorites is empty', async () => {
    fetchIndex.mockResolvedValue(index);
    const { getByText, getByRole } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.click(getByRole('button', { name: 'Show favorites only' }));
    await waitFor(() =>
      expect(getByText('No Pokémon found in your favorites.')).toBeInTheDocument()
    );

    await userEvent.click(getByText('Clear Filters'));
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());
  });

  it('opens the detail modal when a card is clicked and closes it', async () => {
    fetchIndex.mockResolvedValue(index);
    const { getByText, getByLabelText, queryByLabelText, findByText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.click(await findByText('Bulbasaur'));
    await waitFor(() => expect(getByLabelText('Bulbasaur details')).toBeInTheDocument());

    await userEvent.click(getByLabelText('Close details'));
    await waitFor(() => expect(queryByLabelText('Bulbasaur details')).not.toBeInTheDocument());
  });

  it('focuses the search field when "/" is pressed', async () => {
    fetchIndex.mockResolvedValue(index);
    const { getByText, getByLabelText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.keyboard('/');
    expect(getByLabelText('Search Pokémon by name or number')).toHaveFocus();
  });

  it('does not hijack "/" while a text field already has focus', async () => {
    fetchIndex.mockResolvedValue(index);
    const { getByText, getByLabelText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    const search = getByLabelText('Search Pokémon by name or number');
    await userEvent.type(search, '/');
    expect(search).toHaveValue('/');
  });

  it('shows the grid error banner when an individual pokemon detail fetch fails', async () => {
    fetchIndex.mockResolvedValue([...index, { name: 'missingno', id: 999 }]);
    const { getByText, findByText } = renderWithProviders(<App />);
    await findByText('Some Pokémon failed to load.');
    expect(getByText('Bulbasaur')).toBeInTheDocument();
  });

  it('navigates to another pokemon from the evolution chain inside the modal', async () => {
    fetchIndex.mockResolvedValue(index);
    fetchSpecies.mockResolvedValue({
      flavor_text_entries: [],
      genera: [],
      evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
    });
    fetchEvolutionChain.mockResolvedValue({
      chain: {
        species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
        evolves_to: [
          {
            species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
            evolves_to: [],
          },
        ],
      },
    });

    const { getByText, getByLabelText, findByRole, findByText } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.click(await findByText('Bulbasaur'));
    await waitFor(() => expect(getByLabelText('Bulbasaur details')).toBeInTheDocument());

    await userEvent.click(await findByRole('button', { name: 'View Ivysaur' }));
    await waitFor(() => expect(getByLabelText('Ivysaur details')).toBeInTheDocument());
  });

  it('paginates additional pages as the sentinel intersects, and disconnects the observer on cleanup', async () => {
    const bigIndex = Array.from({ length: 30 }, (_, i) => ({ name: `mon${i + 1}`, id: i + 1 }));
    fetchIndex.mockResolvedValue(bigIndex);
    fetchPokemon.mockImplementation((idOrName) => {
      const id = typeof idOrName === 'number' ? idOrName : Number(idOrName.replace('mon', ''));
      return Promise.resolve(pokemonDetail(id, `mon${id}`));
    });

    let ioCallback;
    const disconnectSpy = vi.fn();
    class MockIntersectionObserver {
      constructor(cb) {
        ioCallback = cb;
      }
      observe() {}
      disconnect() {
        disconnectSpy();
      }
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    const { getByText, unmount } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 24 of 30 Pokémon')).toBeInTheDocument());

    act(() => {
      ioCallback([{ isIntersecting: true }]);
    });
    await waitFor(() => expect(getByText('Showing 30 of 30 Pokémon')).toBeInTheDocument());

    unmount();
    expect(disconnectSpy).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('dismisses the grid error banner via its close button without retrying', async () => {
    fetchIndex.mockResolvedValue(index);
    fetchTypeMembers.mockRejectedValue(new Error('boom'));
    const { getByText, getByRole, findByText, queryByText, container } = renderWithProviders(<App />);
    await waitFor(() => expect(getByText('Showing 3 of 3 Pokémon')).toBeInTheDocument());

    await userEvent.click(getByRole('checkbox', { name: 'Fire' }));
    await findByText('Some Pokémon failed to load.');

    const closeBtn = container.querySelector('.mantine-Alert-closeButton');
    await userEvent.click(closeBtn);

    await waitFor(() => expect(queryByText('Some Pokémon failed to load.')).not.toBeInTheDocument());
  });
});
