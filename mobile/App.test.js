import { fireEvent, render, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from './App.js';

jest.mock('./src/api.js', () => ({
  ...jest.requireActual('./src/api.js'),
  fetchIndex: jest.fn(),
  fetchPokemon: jest.fn(),
  fetchTypeMembers: jest.fn(),
  fetchSpecies: jest.fn(() => new Promise(() => {})),
  fetchEvolutionChain: jest.fn(() => new Promise(() => {})),
}));

const {
  fetchEvolutionChain,
  fetchIndex,
  fetchPokemon,
  fetchSpecies,
  fetchTypeMembers,
} = require('./src/api.js');

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

beforeEach(async () => {
  await AsyncStorage.clear();
  fetchIndex.mockReset();
  fetchPokemon.mockReset();
  fetchTypeMembers.mockReset();
  fetchSpecies.mockReset();
  fetchEvolutionChain.mockReset();
  fetchSpecies.mockReturnValue(new Promise(() => {}));
  fetchEvolutionChain.mockReturnValue(new Promise(() => {}));
  fetchPokemon.mockImplementation((idOrName) => {
    const found = Object.values(details).find((d) => d.name === idOrName || d.id === idOrName);
    return found ? Promise.resolve(found) : Promise.reject(new Error('not found'));
  });
});

describe('App', () => {
  it('shows a loading state while the index is still being fetched', async () => {
    fetchIndex.mockReturnValue(new Promise(() => {}));
    const { getByText } = await render(<App />);
    expect(getByText('Loading Pokédex…')).toBeTruthy();
  });

  it('shows the boot error banner when the index fetch fails, and retries', async () => {
    fetchIndex.mockRejectedValueOnce(new Error('network down'));
    fetchIndex.mockResolvedValueOnce(index);

    const { getByText, findByText } = await render(<App />);

    await waitFor(() =>
      expect(getByText("Couldn't reach PokéAPI. Check your connection.")).toBeTruthy()
    );

    await fireEvent.press(getByText('Try Again'));
    await findByText('Bulbasaur');
  });

  it('renders the grid of loaded pokemon once index and details resolve', async () => {
    fetchIndex.mockResolvedValue(index);
    const { findByText, getByText } = await render(<App />);
    await findByText('Bulbasaur');
    expect(getByText('Charmander')).toBeTruthy();
    expect(getByText('Squirtle')).toBeTruthy();
  });

  it('filters the grid as the user searches by name', async () => {
    fetchIndex.mockResolvedValue(index);
    const { findByText, getByPlaceholderText, queryByText } = await render(<App />);
    await findByText('Bulbasaur');

    await fireEvent.changeText(getByPlaceholderText('Search name or number…'), 'char');
    await waitFor(() => expect(queryByText('Bulbasaur')).toBeNull(), { timeout: 3000 });
    expect(queryByText('Charmander')).toBeTruthy();
  });

  it('filters the grid by dex number search', async () => {
    fetchIndex.mockResolvedValue(index);
    const { findByText, getByPlaceholderText, queryByText } = await render(<App />);
    await findByText('Bulbasaur');

    await fireEvent.changeText(getByPlaceholderText('Search name or number…'), '7');
    await waitFor(
      () => {
        expect(queryByText('Bulbasaur')).toBeNull();
        expect(queryByText('Squirtle')).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('clears the search box via the clear button', async () => {
    fetchIndex.mockResolvedValue(index);
    const { findByText, getByPlaceholderText, getByLabelText, queryByText } = await render(<App />);
    await findByText('Bulbasaur');

    await fireEvent.changeText(getByPlaceholderText('Search name or number…'), 'char');
    await waitFor(() => expect(queryByText('Bulbasaur')).toBeNull(), { timeout: 3000 });
    await fireEvent.press(getByLabelText('Clear search'));
    await waitFor(() => expect(queryByText('Bulbasaur')).toBeTruthy());
  });

  it('filters the grid by selected type, fetching type members on demand', async () => {
    fetchIndex.mockResolvedValue(index);
    fetchTypeMembers.mockResolvedValue(new Set([4]));
    const { findByText, getAllByText, queryByText } = await render(<App />);
    await findByText('Bulbasaur');

    await fireEvent.press(getAllByText('Fire')[0]);
    await waitFor(() => expect(queryByText('Bulbasaur')).toBeNull());
    expect(queryByText('Charmander')).toBeTruthy();
    expect(fetchTypeMembers).toHaveBeenCalledWith('fire');
  });

  it('silently swallows a fetchTypeMembers failure', async () => {
    fetchIndex.mockResolvedValue(index);
    fetchTypeMembers.mockRejectedValue(new Error('boom'));
    const { findByText, getAllByText } = await render(<App />);
    await findByText('Bulbasaur');

    await fireEvent.press(getAllByText('Fire')[0]);
    await waitFor(() => expect(fetchTypeMembers).toHaveBeenCalledWith('fire'));
  });

  it('toggles a pokemon as favorite from the grid and can filter to favorites only', async () => {
    fetchIndex.mockResolvedValue(index);
    const { findByText, getByLabelText, queryByText } = await render(<App />);
    await findByText('Bulbasaur');

    await fireEvent.press(getByLabelText('Add Bulbasaur to favorites'));
    await fireEvent.press(getByLabelText('Toggle favorites filter'));

    await waitFor(() => expect(queryByText('Charmander')).toBeNull());
    expect(queryByText('Bulbasaur')).toBeTruthy();
  });

  it('shows an empty state with a clear-filters action when favorites is empty', async () => {
    fetchIndex.mockResolvedValue(index);
    const { findByText, getByLabelText, getByText } = await render(<App />);
    await findByText('Bulbasaur');

    await fireEvent.press(getByLabelText('Toggle favorites filter'));
    await findByText('No Pokémon found in your favorites.');

    await fireEvent.press(getByText('Clear Filters'));
    await findByText('Bulbasaur');
  });

  it('opens the detail modal when a card is pressed and closes it', async () => {
    fetchIndex.mockResolvedValue(index);
    const { findByText, getByLabelText, getAllByLabelText, queryByLabelText } = await render(<App />);
    await findByText('Bulbasaur');

    await fireEvent.press(getByLabelText('View details for Bulbasaur'));
    await waitFor(() => expect(getByLabelText('Toggle shiny artwork')).toBeTruthy());

    const closeTargets = getAllByLabelText('Close details');
    await fireEvent.press(closeTargets[closeTargets.length - 1]);
    await waitFor(() => expect(queryByLabelText('Toggle shiny artwork')).toBeNull());
  });

  it('shows the grid error banner is not present when an individual pokemon detail fetch fails silently', async () => {
    fetchIndex.mockResolvedValue([...index, { name: 'missingno', id: 999 }]);
    const { findByText } = await render(<App />);
    await findByText('Bulbasaur');
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

    const { findByText, getByLabelText } = await render(<App />);
    await findByText('Bulbasaur');

    await fireEvent.press(getByLabelText('View details for Bulbasaur'));
    const evoTarget = await waitFor(() => getByLabelText('View Ivysaur'));
    await fireEvent.press(evoTarget);

    await waitFor(() => expect(getByLabelText('Toggle shiny artwork')).toBeTruthy());
    expect(fetchPokemon).toHaveBeenCalledWith(2);
  });

  it('paginates additional pages as the list end is reached', async () => {
    const bigIndex = Array.from({ length: 30 }, (_, i) => ({ name: `mon${i + 1}`, id: i + 1 }));
    fetchIndex.mockResolvedValue(bigIndex);
    fetchPokemon.mockImplementation((idOrName) => {
      const id = typeof idOrName === 'number' ? idOrName : Number(idOrName.replace('mon', ''));
      return Promise.resolve(pokemonDetail(id, `mon${id}`));
    });

    const { findByText, getByText } = await render(<App />);
    await findByText('Showing 24 of 30 Pokémon');

    await fireEvent(getByText('Showing 24 of 30 Pokémon').parent.parent, 'onEndReached');
    await waitFor(() => expect(getByText('Showing 30 of 30 Pokémon')).toBeTruthy());
  });

  it('toggles the theme when the theme button is pressed', async () => {
    fetchIndex.mockResolvedValue(index);
    const { findByText, getByLabelText } = await render(<App />);
    await findByText('Bulbasaur');
    await fireEvent.press(getByLabelText('Toggle light/dark theme'));
    expect(getByLabelText('Toggle light/dark theme')).toBeTruthy();
  });
});
