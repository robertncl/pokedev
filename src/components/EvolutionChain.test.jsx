import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EvolutionChain from './EvolutionChain.jsx';

vi.mock('../data.js', async (importOriginal) => ({
  ...(await importOriginal()),
  prefetchDetails: vi.fn(),
}));

import { prefetchDetails } from '../data.js';

const charmanderLine = [[4], [5], [6]];
const eeveelutions = [[133], [134, 135, 136]];

describe('EvolutionChain', () => {
  it('shows a message when the pokemon does not evolve', () => {
    const { getByText } = render(<EvolutionChain levels={[[128]]} currentId={128} onNavigate={() => {}} />);
    expect(getByText('This Pokémon does not evolve.')).toBeInTheDocument();
  });

  it('renders every stage across a multi-step chain with its thumbnail', () => {
    const { getByText, container } = render(
      <EvolutionChain levels={charmanderLine} currentId={4} onNavigate={() => {}} />
    );
    expect(getByText('Charmander')).toBeInTheDocument();
    expect(getByText('Charmeleon')).toBeInTheDocument();
    expect(getByText('Charizard')).toBeInTheDocument();
    expect([...container.querySelectorAll('img')].map((img) => img.getAttribute('src'))).toEqual([
      '/art/4.avif',
      '/art/5.avif',
      '/art/6.avif',
    ]);
  });

  it('renders branched evolutions within the same stage', () => {
    const { getByText } = render(<EvolutionChain levels={eeveelutions} currentId={133} onNavigate={() => {}} />);
    expect(getByText('Eevee')).toBeInTheDocument();
    expect(getByText('Vaporeon')).toBeInTheDocument();
    expect(getByText('Jolteon')).toBeInTheDocument();
    expect(getByText('Flareon')).toBeInTheDocument();
  });

  it('marks the current stage as disabled and labels it distinctly', () => {
    const { getByRole } = render(<EvolutionChain levels={charmanderLine} currentId={5} onNavigate={() => {}} />);
    expect(getByRole('button', { name: 'Charmeleon (current)' })).toBeDisabled();
  });

  it('calls onNavigate with the target stage id when a non-current stage is clicked', async () => {
    const onNavigate = vi.fn();
    const { getByRole } = render(<EvolutionChain levels={charmanderLine} currentId={4} onNavigate={onNavigate} />);
    await userEvent.click(getByRole('button', { name: 'View Charizard' }));
    expect(onNavigate).toHaveBeenCalledWith(6);
  });

  it('prefetches details for a stage on hover', () => {
    const { getByRole } = render(<EvolutionChain levels={charmanderLine} currentId={4} onNavigate={() => {}} />);
    fireEvent.pointerEnter(getByRole('button', { name: 'View Charmeleon' }));
    expect(prefetchDetails).toHaveBeenCalledWith(5);
  });
});
