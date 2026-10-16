import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PokemonCard from './PokemonCard.jsx';

vi.mock('../data.js', () => ({ prefetchDetails: vi.fn() }));

import { prefetchDetails } from '../data.js';

const pikachu = { id: 25, name: 'pikachu', types: ['electric'] };

function setup(props = {}) {
  const onSelect = vi.fn();
  const onToggleFavorite = vi.fn();
  const utils = render(
    <PokemonCard
      pokemon={pikachu}
      index={0}
      isFavorite={false}
      onToggleFavorite={onToggleFavorite}
      onSelect={onSelect}
      {...props}
    />
  );
  return { ...utils, onSelect, onToggleFavorite };
}

const artwork = (container) => container.querySelector('img');

beforeEach(() => {
  prefetchDetails.mockClear();
});

describe('PokemonCard', () => {
  it('renders id, name, type badges and the self-hosted thumbnail', () => {
    const { getByText, container } = setup();
    expect(getByText('#0025')).toBeInTheDocument();
    expect(getByText('Pikachu')).toBeInTheDocument();
    expect(getByText('Electric')).toBeInTheDocument();
    expect(artwork(container)).toHaveAttribute('src', '/art/25.avif');
    expect(artwork(container)).toHaveAttribute('alt', '');
  });

  it('loads the first cards eagerly, the very first at high priority', () => {
    const first = setup({ index: 0 });
    expect(artwork(first.container)).toHaveAttribute('fetchpriority', 'high');
    expect(artwork(first.container)).not.toHaveAttribute('loading');

    const fifth = setup({ index: 4 });
    expect(artwork(fifth.container)).not.toHaveAttribute('fetchpriority');
    expect(artwork(fifth.container)).not.toHaveAttribute('loading');
  });

  it('lazy-loads artwork further down the grid', () => {
    const { container } = setup({ index: 15 });
    expect(artwork(container)).toHaveAttribute('loading', 'lazy');
  });

  it('defers rendering of cards past the first page', () => {
    expect(setup({ index: 23 }).container.querySelector('article')).not.toHaveClass('deferred');
    expect(setup({ index: 24 }).container.querySelector('article')).toHaveClass('deferred');
  });

  it('calls onSelect with the id when the card is clicked', async () => {
    const { getByRole, onSelect } = setup();
    await userEvent.click(getByRole('button', { name: 'View details for Pikachu' }));
    expect(onSelect).toHaveBeenCalledWith(25);
  });

  it.each([['{Enter}'], [' ']])('calls onSelect when %s is pressed on the card', async (key) => {
    const { getByRole, onSelect } = setup();
    getByRole('button', { name: 'View details for Pikachu' }).focus();
    await userEvent.keyboard(key);
    expect(onSelect).toHaveBeenCalledWith(25);
  });

  it('toggles favorite without triggering onSelect', async () => {
    const { getByRole, onSelect, onToggleFavorite } = setup({ isFavorite: true });
    const favoriteBtn = getByRole('button', { name: 'Remove Pikachu from favorites' });
    expect(favoriteBtn).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(favoriteBtn);
    expect(onToggleFavorite).toHaveBeenCalledWith(25);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('keeps the favorite button out of the card button, as its own tab stop', async () => {
    const { getByRole } = setup();
    const favorite = getByRole('button', { name: 'Add Pikachu to favorites' });
    const open = getByRole('button', { name: 'View details for Pikachu' });
    expect(open).not.toContainElement(favorite);
    await userEvent.tab();
    expect(favorite).toHaveFocus();
    await userEvent.tab();
    expect(open).toHaveFocus();
  });

  it('prefetches details when the card is hovered or focused', () => {
    const { container, getByRole } = setup();
    fireEvent.pointerEnter(container.querySelector('article'));
    expect(prefetchDetails).toHaveBeenCalledWith(25);
    prefetchDetails.mockClear();
    getByRole('button', { name: 'View details for Pikachu' }).focus();
    expect(prefetchDetails).toHaveBeenCalledWith(25);
  });
});
