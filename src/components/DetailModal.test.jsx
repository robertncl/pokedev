import { MantineProvider } from '@mantine/core';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { theme } from '../theme.js';
import { renderWithProviders, waitFor } from '../test/render.jsx';
import DetailModal from './DetailModal.jsx';

vi.mock('../api.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchSpecies: vi.fn(),
    fetchEvolutionChain: vi.fn(),
  };
});

import { fetchEvolutionChain, fetchSpecies } from '../api.js';

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
          {
            species: { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon-species/6/' },
            evolves_to: [],
          },
        ],
      },
    ],
  },
};

beforeEach(() => {
  fetchSpecies.mockReset();
  fetchEvolutionChain.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function setup(props = {}) {
  const onClose = vi.fn();
  const onToggleFavorite = vi.fn();
  const onNavigate = vi.fn();
  const utils = renderWithProviders(
    <DetailModal
      pokemon={pokemon}
      isFavorite={false}
      onToggleFavorite={onToggleFavorite}
      onClose={onClose}
      onNavigate={onNavigate}
      {...props}
    />
  );
  return { ...utils, onClose, onToggleFavorite, onNavigate };
}

describe('DetailModal', () => {
  it('shows loading placeholders before species/evolution data resolves', () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const { getByText } = setup();
    expect(getByText('Loading Pokédex entry…')).toBeInTheDocument();
    expect(getByText('Loading evolution chain…')).toBeInTheDocument();
  });

  it('renders name, dex number, stats, abilities, and flavor text once loaded', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByText } = setup();

    expect(getByText('#0006')).toBeInTheDocument();
    expect(getByText('Charizard')).toBeInTheDocument();

    await waitFor(() => expect(getByText('Flame Pokémon')).toBeInTheDocument());
    expect(getByText('Spits fire that is hot.')).toBeInTheDocument();
    expect(getByText('Blaze')).toBeInTheDocument();
    expect(getByText('· hidden')).toBeInTheDocument();
    expect(getByText('162')).toBeInTheDocument(); // stat total 78 + 84
    expect(getByText('1.7 m')).toBeInTheDocument();
    expect(getByText('90.5 kg')).toBeInTheDocument();
    expect(getByText('267')).toBeInTheDocument();
  });

  it('shows a fallback message when there is no English flavor text', async () => {
    fetchSpecies.mockResolvedValue({ ...species, flavor_text_entries: [] });
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByText } = setup();
    await waitFor(() => expect(getByText('No Pokédex entry available.')).toBeInTheDocument());
  });

  it('shows "no evolution data" when species has no evolution_chain url', async () => {
    fetchSpecies.mockResolvedValue({ ...species, evolution_chain: undefined });
    const { getByText } = setup();
    await waitFor(() => expect(getByText('No evolution data available.')).toBeInTheDocument());
    expect(fetchEvolutionChain).not.toHaveBeenCalled();
  });

  it('shows "no evolution data" when fetchSpecies rejects', async () => {
    fetchSpecies.mockRejectedValue(new Error('boom'));
    const { getByText } = setup();
    await waitFor(() => expect(getByText('No evolution data available.')).toBeInTheDocument());
  });

  it('shows "no evolution data" when fetchEvolutionChain rejects after species resolves', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockRejectedValue(new Error('boom'));
    const { getByText } = setup();
    await waitFor(() => expect(getByText('No evolution data available.')).toBeInTheDocument());
  });

  it('renders the evolution chain once loaded and forwards navigation', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByText, getByRole, onNavigate } = setup();
    await waitFor(() => expect(getByText('Charmander')).toBeInTheDocument());
    await userEvent.click(getByRole('button', { name: 'View Charmeleon' }));
    expect(onNavigate).toHaveBeenCalledWith(5);
  });

  it('shows Base XP as an em dash when base_experience is missing', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByText } = setup({
      pokemon: { ...pokemon, base_experience: undefined },
    });
    await waitFor(() => expect(getByText('Flame Pokémon')).toBeInTheDocument());
    expect(getByText('—')).toBeInTheDocument();
  });

  it('toggles shiny artwork and reverts on image error', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { getByLabelText, getByAltText } = setup();
    const toggle = getByLabelText('Toggle shiny artwork');
    await userEvent.click(toggle);
    const img = getByAltText('Charizard');
    expect(img).toHaveAttribute('src', 'shiny.png');

    img.dispatchEvent(new Event('error', { bubbles: true }));
    await waitFor(() => expect(getByAltText('Charizard')).toHaveAttribute('src', 'art.png'));
  });

  it('falls back to constants artwork URLs when no sprite artwork is present', () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const bare = { ...pokemon, sprites: {} };
    const { getByAltText } = setup({ pokemon: bare });
    expect(getByAltText('Charizard')).toHaveAttribute(
      'src',
      expect.stringContaining('/6.png')
    );
  });

  it('falls back to the constants shiny artwork URL when no shiny sprite is present', async () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const bare = { ...pokemon, sprites: {} };
    const { getByLabelText, getByAltText } = setup({ pokemon: bare });
    await userEvent.click(getByLabelText('Toggle shiny artwork'));
    expect(getByAltText('Charizard')).toHaveAttribute(
      'src',
      expect.stringContaining('/shiny/6.png')
    );
  });

  it('calls onToggleFavorite with the pokemon id and reflects favorite state', async () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const { getByLabelText, onToggleFavorite, rerender } = setup({ isFavorite: false });
    await userEvent.click(getByLabelText('Add to favorites'));
    expect(onToggleFavorite).toHaveBeenCalledWith(6);
  });

  it('shows "Remove from favorites" label when already a favorite', () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const { getByLabelText } = setup({ isFavorite: true });
    expect(getByLabelText('Remove from favorites')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    const { getByLabelText, onClose } = setup();
    await userEvent.click(getByLabelText('Close details'));
    expect(onClose).toHaveBeenCalled();
  });

  it('re-fetches species/chain and resets state when the pokemon prop changes', async () => {
    fetchSpecies.mockResolvedValue(species);
    fetchEvolutionChain.mockResolvedValue(evolutionChain);
    const { rerender, getByText } = setup();
    await waitFor(() => expect(getByText('Flame Pokémon')).toBeInTheDocument());

    fetchSpecies.mockClear();
    fetchSpecies.mockReturnValue(new Promise(() => {}));
    rerender(
      <MantineProvider theme={theme}>
        <DetailModal
          pokemon={{ ...pokemon, id: 7, name: 'squirtle' }}
          isFavorite={false}
          onToggleFavorite={() => {}}
          onClose={() => {}}
          onNavigate={() => {}}
        />
      </MantineProvider>
    );
    expect(getByText('Loading Pokédex entry…')).toBeInTheDocument();
    expect(fetchSpecies).toHaveBeenCalled();
  });
});
