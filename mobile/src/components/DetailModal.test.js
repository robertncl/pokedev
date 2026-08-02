import { fireEvent, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../theme.js';
import { renderWithProviders } from '../test/render.js';
import DetailModal from './DetailModal.js';

jest.mock('../api.js', () => ({
  ...jest.requireActual('../api.js'),
  fetchSpecies: jest.fn(),
  fetchEvolutionChain: jest.fn(),
}));

const { fetchEvolutionChain, fetchSpecies } = require('../api.js');

const pokemon = {
  id: 6,
  name: 'charizard',
  species: { url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
  sprites: { other: { 'official-artwork': { front_default: 'art.png', front_shiny: 'shiny.png' } } },
  types: [{ type: { name: 'fire' } }, { type: { name: 'flying' } }],
  abilities: [
    { ability: { name: 'blaze' }, slot: 1, is_hidden: false },
    { ability: { name: 'solar-power' }, slot: 3, is_hidden: true },
  ],
  stats: [
    { stat: { name: 'hp' }, base_stat: 78 },
    { stat: { name: 'attack' }, base_stat: 84 },
  ],
  height: 17,
  weight: 905,
  base_experience: 267,
};

const species = {
  flavor_text_entries: [
    { language: { name: 'en' }, flavor_text: 'Old entry.' },
    { language: { name: 'en' }, flavor_text: 'Spits fire\nthat is hot.' },
    { language: { name: 'fr' }, flavor_text: 'Non applicable' },
  ],
  genera: [{ language: { name: 'en' }, genus: 'Flame Pokémon' }],
  evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/2/' },
};

const evolutionChain = {
  chain: {
    species: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon-species/4/' },
    evolves_to: [
      {
        species: { name: 'charmeleon', url: 'https://pokeapi.co/api/v2/pokemon-species/5/' },
        evolves_to: [
          { species: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' }, evolves_to: [] },
        ],
      },
    ],
  },
};

beforeEach(() => {
  fetchSpecies.mockReset();
  fetchEvolutionChain.mockReset();
});

function setup(props = {}) {
  const onClose = jest.fn();
  const onToggleFavorite = jest.fn();
  const onNavigate = jest.fn();
  return renderWithProviders(
    <DetailModal
      pokemon={pokemon}
      isFavorite={false}
      onToggleFavorite={onToggleFavorite}
      onClose={onClose}
      onNavigate={onNavigate}
      {...props}
    />
  ).then((utils) => ({ ...utils, onClose, onToggleFavorite, onNavigate }));
}

describe('DetailModal', () => {
  it('shows loading placeholders before species/evolution data resolves', async () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const { getByText } = await setup();
    expect(getByText('Loading Pokédex entry…')).toBeTruthy();
    expect(getByText('Loading evolution chain…')).toBeTruthy();
  });

  it('renders name, dex number, stats, abilities, and flavor text once loaded', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByText, getAllByText } = await setup();

    expect(getByText('#0006')).toBeTruthy();
    expect(getAllByText('Charizard').length).toBeGreaterThan(0);

    await waitFor(() => expect(getByText('Flame Pokémon')).toBeTruthy());
    expect(getByText('Spits fire that is hot.')).toBeTruthy();
    expect(getByText('Blaze')).toBeTruthy();
    expect(getByText('162')).toBeTruthy();
    expect(getByText('1.7 m')).toBeTruthy();
    expect(getByText('90.5 kg')).toBeTruthy();
    expect(getByText('267')).toBeTruthy();
  });

  it('shows a fallback message when there is no English flavor text', async () => {
    fetchSpecies.mockResolvedValue({ ...species, flavor_text_entries: [] });
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByText } = await setup();
    await waitFor(() => expect(getByText('No Pokédex entry available.')).toBeTruthy());
  });

  it('shows "no evolution data" when species has no evolution_chain url', async () => {
    fetchSpecies.mockResolvedValue({ ...species, evolution_chain: undefined });
    const { getByText } = await setup();
    await waitFor(() => expect(getByText('No evolution data available.')).toBeTruthy());
    expect(fetchEvolutionChain).not.toHaveBeenCalled();
  });

  it('shows "no evolution data" when fetchSpecies rejects', async () => {
    fetchSpecies.mockRejectedValue(new Error('boom'));
    const { getByText } = await setup();
    await waitFor(() => expect(getByText('No evolution data available.')).toBeTruthy());
  });

  it('shows "no evolution data" when fetchEvolutionChain rejects after species resolves', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockRejectedValue(new Error('boom'));
    const { getByText } = await setup();
    await waitFor(() => expect(getByText('No evolution data available.')).toBeTruthy());
  });

  it('renders the evolution chain once loaded and forwards navigation', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByText, getByLabelText, onNavigate } = await setup();
    await waitFor(() => expect(getByText('Charmander')).toBeTruthy());
    await fireEvent.press(getByLabelText('View Charmeleon'));
    expect(onNavigate).toHaveBeenCalledWith(5);
  });

  it('shows Base XP as an em dash when base_experience is missing', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByText } = await setup({ pokemon: { ...pokemon, base_experience: undefined } });
    await waitFor(() => expect(getByText('Flame Pokémon')).toBeTruthy());
    expect(getByText('—')).toBeTruthy();
  });

  it('toggles shiny artwork', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByLabelText } = await setup();
    await fireEvent.press(getByLabelText('Toggle shiny artwork'));
    expect(getByLabelText('Toggle shiny artwork')).toBeTruthy();
  });

  it('calls onToggleFavorite with the pokemon id', async () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const { getByLabelText, onToggleFavorite } = await setup({ isFavorite: false });
    await fireEvent.press(getByLabelText('Toggle favorite'));
    expect(onToggleFavorite).toHaveBeenCalledWith(6);
  });

  it('calls onClose when the close button is pressed', async () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const { getAllByLabelText, onClose } = await setup();
    const closeTargets = getAllByLabelText('Close details');
    await fireEvent.press(closeTargets[closeTargets.length - 1]);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the backdrop is pressed', async () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const { getAllByLabelText, onClose } = await setup();
    await fireEvent.press(getAllByLabelText('Close details')[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('re-fetches species/chain and resets state when the pokemon prop changes', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { rerender, getByText } = await setup();
    await waitFor(() => expect(getByText('Flame Pokémon')).toBeTruthy());

    fetchSpecies.mockClear();
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    await rerender(
      <SafeAreaProvider>
        <ThemeProvider>
          <DetailModal
            pokemon={{ ...pokemon, id: 7, name: 'squirtle' }}
            isFavorite={false}
            onToggleFavorite={() => {}}
            onClose={() => {}}
            onNavigate={() => {}}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    );
    await waitFor(() => expect(getByText('Loading Pokédex entry…')).toBeTruthy());
    expect(fetchSpecies).toHaveBeenCalled();
  });
});
