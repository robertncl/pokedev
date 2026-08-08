import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render.jsx';
import EvolutionChain from './EvolutionChain.jsx';

const singleStageChain = {
  species: { name: 'tauros', url: 'https://pokeapi.co/api/v2/pokemon-species/128/' },
  evolves_to: [],
};

const branchedChain = {
  species: { name: 'eevee', url: 'https://pokeapi.co/api/v2/pokemon-species/133/' },
  evolves_to: [
    {
      species: { name: 'vaporeon', url: 'https://pokeapi.co/api/v2/pokemon-species/134/' },
      evolves_to: [],
    },
    {
      species: { name: 'jolteon', url: 'https://pokeapi.co/api/v2/pokemon-species/135/' },
      evolves_to: [],
    },
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
  it('shows a message when the pokemon does not evolve', () => {
    const { getByText } = renderWithProviders(
      <EvolutionChain chain={singleStageChain} currentId={128} onNavigate={() => {}} />
    );
    expect(getByText('This Pokémon does not evolve.')).toBeInTheDocument();
  });

  it('renders every stage across a multi-step chain', () => {
    const { getByText } = renderWithProviders(
      <EvolutionChain chain={linearChain} currentId={4} onNavigate={() => {}} />
    );
    expect(getByText('Charmander')).toBeInTheDocument();
    expect(getByText('Charmeleon')).toBeInTheDocument();
    expect(getByText('Charizard')).toBeInTheDocument();
  });

  it('renders branched evolutions within the same stage', () => {
    const { getByText } = renderWithProviders(
      <EvolutionChain chain={branchedChain} currentId={133} onNavigate={() => {}} />
    );
    expect(getByText('Eevee')).toBeInTheDocument();
    expect(getByText('Vaporeon')).toBeInTheDocument();
    expect(getByText('Jolteon')).toBeInTheDocument();
  });

  it('marks the current stage as disabled and labels it distinctly', () => {
    const { getByRole } = renderWithProviders(
      <EvolutionChain chain={linearChain} currentId={5} onNavigate={() => {}} />
    );
    const current = getByRole('button', { name: 'Charmeleon (current)' });
    expect(current).toBeDisabled();
  });

  it('calls onNavigate with the target stage id when a non-current stage is clicked', async () => {
    const onNavigate = vi.fn();
    const { getByRole } = renderWithProviders(
      <EvolutionChain chain={linearChain} currentId={4} onNavigate={onNavigate} />
    );
    await userEvent.click(getByRole('button', { name: 'View Charizard' }));
    expect(onNavigate).toHaveBeenCalledWith(6);
  });
});
