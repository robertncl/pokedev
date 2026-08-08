import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../test/render.js';
import EvolutionChain from './EvolutionChain.js';

const singleStageChain = {
  species: { name: 'tauros', url: 'https://pokeapi.co/api/v2/pokemon-species/128/' },
  evolves_to: [],
};

const branchedChain = {
  species: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' },
  evolves_to: [
    { species: { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon-species/134/' }, evolves_to: [] },
    { species: { name: 'jolteon', url: 'https://pokeapi.co/api/v2/pokemon-species/135/' }, evolves_to: [] },
  ],
};

const linearChain = {
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
};

describe('EvolutionChain', () => {
  it('shows a message when the pokemon does not evolve', async () => {
    const { getByText } = await renderWithProviders(
      <EvolutionChain chain={singleStageChain} currentId={128} onNavigate={() => {}} />
    );
    expect(getByText('This Pokémon does not evolve.')).toBeTruthy();
  });

  it('renders every stage across a multi-step chain', async () => {
    const { getByText } = await renderWithProviders(
      <EvolutionChain chain={linearChain} currentId={4} onNavigate={() => {}} />
    );
    expect(getByText('Charmander')).toBeTruthy();
    expect(getByText('Charmeleon')).toBeTruthy();
    expect(getByText('Charizard')).toBeTruthy();
  });

  it('renders branched evolutions within the same stage', async () => {
    const { getByText } = await renderWithProviders(
      <EvolutionChain chain={branchedChain} currentId={133} onNavigate={() => {}} />
    );
    expect(getByText('Eevee')).toBeTruthy();
    expect(getByText('Vaporeon')).toBeTruthy();
    expect(getByText('Jolteon')).toBeTruthy();
  });

  it('marks the current stage as disabled and labels it distinctly', async () => {
    const { getByLabelText } = await renderWithProviders(
      <EvolutionChain chain={linearChain} currentId={5} onNavigate={() => {}} />
    );
    expect(getByLabelText('Charmeleon (current)')).toBeTruthy();
  });

  it('calls onNavigate with the target stage id when a non-current stage is pressed', async () => {
    const onNavigate = jest.fn();
    const { getByLabelText } = await renderWithProviders(
      <EvolutionChain chain={linearChain} currentId={4} onNavigate={onNavigate} />
    );
    await fireEvent.press(getByLabelText('View Charizard'));
    expect(onNavigate).toHaveBeenCalledWith(6);
  });
});
